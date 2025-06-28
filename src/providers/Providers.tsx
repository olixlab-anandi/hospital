"use client";

import React, { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import store, { persistor } from "../../store/store";
import { PersistGate } from "redux-persist/integration/react";

interface providerPropes {
  children: ReactNode;
}

function Providers({ children }: providerPropes) {
  return (
    <>
      <PersistGate persistor={persistor}>
        <Provider store={store}>{children}</Provider>
      </PersistGate>

      <ToastContainer autoClose={500} />
    </>
  );
}

export default Providers;
