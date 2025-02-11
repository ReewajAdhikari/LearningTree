

'use client'

import Navbar from "../components/Navbar";
import SearchList from "./SearchList";

import React,{ useEffect, useState} from "react";

export default function Explore() {
    return(
        <>
            <Navbar/>
            <main className="pt-4">
                <SearchList />
            </main>
        </>
        )
}
