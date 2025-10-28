"use client"

import React from "react";
import ConnectButton from "./connect";
import { Button } from "./ui/button";
import { SiVault } from "react-icons/si";
import { GiLiquidSoap } from "react-icons/gi";
import { BsBank } from "react-icons/bs";
import { GiTakeMyMoney } from "react-icons/gi";
import { useRouter } from "next/navigation";

const Narvbar =()=>{
    const router = useRouter();
    return(
        <main className="h-40 w-full flex flex-col bg-backGroundColor   gap-8  ">
            <div className="w-full flex justify-between items-center" >
                <h1 className="text-textColor">COINCREDD</h1>
                <div className=" rounded-xl border-2 border-textColor">
                <ConnectButton/>
                </div>

               



            </div>
            <div className="w-full flex justify-evenly  items-center bg-cardBackgroud rounded-xl" >
<Button onClick={()=> router.replace("/")} className="flex gap-2 justify-between items-center" variant="default"><SiVault/> Smart Vaults</Button>
<Button onClick={()=> router.replace("/liquidate")} className="flex gap-2 justify-between items-center" variant="default"><GiLiquidSoap /> Liquidate</Button>
<Button onClick={()=> router.replace("/requests")} className="flex gap-2 justify-between items-center" variant="default"><BsBank/> Requests</Button>
<Button onClick={()=> router.replace("/loanissue")} className="flex gap-2 justify-between items-center" variant="default"><GiTakeMyMoney/> Loans Issued</Button>
<Button onClick={()=> router.replace("/faucet")} className="flex gap-2 justify-between items-center" variant="default"><GiTakeMyMoney/> Faucet</Button>





            </div>



        </main>
        
    )
}

export default Narvbar;