
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { Product, Customer, Transaction, TransactionType, User } from '../types';
import { db } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  query,
  orderBy,
  increment
} from 'firebase/firestore';

interface StoreContextType {
  user: User | null;
  users: User[];
  products: Product[];
  customers: Customer[];
  transactions: Transaction[];
  loading: boolean;
  
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  addUser: (user: User) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children?: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'usuarios'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data() } as User)));
      setLoadingUsers(false);
    });

    const unsubProducts = onSnapshot(query(collection(db, 'productos'), orderBy('name')), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });

    const unsubCustomers = onSnapshot(query(collection(db, 'clientes'), orderBy('name')), (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));
    });

    const unsubTransactions = onSnapshot(query(collection(db, 'transacciones'), orderBy('date', 'desc')), (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
      setLoadingTransactions(false);
    });

    return () => {
      unsubUsers();
      unsubProducts();
      unsubCustomers();
      unsubTransactions();
    };
  }, []);

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    await addDoc(collection(db, 'productos'), productData);
  };

  const updateProduct = async (product: Product) => {
    const { id, ...data } = product;
    await updateDoc(doc(db, 'productos', id), data as any);
  };

  const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, 'productos', id));
  };

  const addCustomer = async (customerData: Omit<Customer, 'id'>) => {
    await addDoc(collection(db, 'clientes'), customerData);
  };

  const updateCustomer = async (customer: Customer) => {
    const { id, ...data } = customer;
    await updateDoc(doc(db, 'clientes', id), data as any);
  };

  const deleteCustomer = async (id: string) => {
    await deleteDoc(doc(db, 'clientes', id));
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    // 1. Guardar la transacción en sí
    await addDoc(collection(db, 'transacciones'), transactionData);

    // 2. Lógica de automatización: Si es Venta, descontar stock y sumar deuda si aplica
    if (transactionData.type === TransactionType.SALE) {
        // Descontar Stock si hay producto vinculado
        if (transactionData.productId) {
            const productRef = doc(db, 'productos', transactionData.productId);
            await updateDoc(productRef, {
                stock: increment(-1) // Restamos una unidad
            });
        }
        // Aumentar Deuda si hay cliente vinculado
        if (transactionData.customerId) {
            const customerRef = doc(db, 'clientes', transactionData.customerId);
            await updateDoc(customerRef, {
                debt: increment(transactionData.amount) // Sumamos el monto a su cuenta
            });
        }
    } else if (transactionData.type === TransactionType.EXPENSE) {
        // Si fuera un gasto que reduce deuda (pago de cliente), se manejaría aquí.
    }
  };

  const updateTransaction = async (transaction: Transaction) => {
    const { id, ...data } = transaction;
    await updateDoc(doc(db, 'transacciones', id), data as any);
  };

  const deleteTransaction = async (id: string) => {
    await deleteDoc(doc(db, 'transacciones', id));
  };

  const addUser = async (userData: User) => {
    await setDoc(doc(db, 'usuarios', userData.id), userData);
  };

  const updateUser = async (updatedUser: User) => {
    await setDoc(doc(db, 'usuarios', updatedUser.id), updatedUser);
    if (user && user.id === updatedUser.id) setUser(updatedUser);
  };

  const deleteUser = async (id: string) => {
    await deleteDoc(doc(db, 'usuarios', id));
  };

  const login = useCallback((pin: string) => {
    const foundUser = users.find(u => u.pin === pin);
    if (foundUser) {
      setUser(foundUser);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, [users]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    users,
    products,
    customers,
    transactions,
    loading: loadingUsers || loadingTransactions,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addUser,
    updateUser,
    deleteUser,
    isAuthenticated,
    login,
    logout
  }), [user, users, products, customers, transactions, loadingUsers, loadingTransactions, isAuthenticated, login, logout]);

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
