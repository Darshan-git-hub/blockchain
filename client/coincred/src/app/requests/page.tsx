
import Image from "next/image";
import React from "react";
import LoanLiquidate from "@/components/LoanLiquidate";
import LoanUserRequests from "@/components/LoanUserRequets";

export default function Home() {
  return (
    <main className=" h-screen  ">
      <LoanUserRequests/>
      
    </main>
  );
}
