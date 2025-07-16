"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type ShopsContextType = {
  selectedShop: any;
  setSelectedShop: React.Dispatch<React.SetStateAction<any>>;
  shops: Array<any>;
  setShops: React.Dispatch<React.SetStateAction<Array<any>>>;
  fetchedShops: Array<any>;
  setFetchedShops: React.Dispatch<React.SetStateAction<Array<any>>>;
};

export const ShopsContext = createContext<ShopsContextType>({} as ShopsContextType);

type ShopsContextProviderProps = {
  children: React.ReactNode;
};
export const ShopsContextProvider = ({
  children,
}: ShopsContextProviderProps) => {
  const [selectedShop, setSelectedShop] = useState<any>(null);

  const [shops, setShops] = useState<Array<any>>([]);
  const [fetchedShops, setFetchedShops] = useState<Array<any>>([]);

  useEffect(() => {
    // console.log(selectedShop);
    if (shops.length === 0) return;
    setSelectedShop(shops[0]);
  }, [shops]);

  const value = {
    selectedShop,
    setSelectedShop,
    shops,
    fetchedShops,
    setShops,
    setFetchedShops
  };

  return (
    <ShopsContext.Provider value={value}>{children}</ShopsContext.Provider>
  );
};

export const useShopsContext = () => useContext(ShopsContext);
