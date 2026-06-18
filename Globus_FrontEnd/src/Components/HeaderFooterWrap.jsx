import React from "react";
import { Outlet } from "react-router-dom"; 
import Header from "./Header";
import Footer from "./Footer";

const HeaderFooterWrap = () => {
    return (
        <div>
            <Header />
            <main>
                <Outlet /> 
            </main>
            <Footer />
        </div>
    );
};

export default HeaderFooterWrap;
