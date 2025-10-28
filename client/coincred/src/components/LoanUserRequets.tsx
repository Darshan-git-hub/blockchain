"use client"
import React, { useState } from "react";
import { ScrollArea,ScrollBar } from "./ui/scroll-area";
import { parseEther,formatEther } from "viem";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "./ui/alert-dialog"
import { Badge } from "./ui/badge";
import { countdown } from "@/hooks/timeConversion";
import { Input } from "./ui/input";
import { LoanRequestss } from "@/helpers/data"; 
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue, } from "./ui/select";
import { Popover,
    PopoverContent,
    PopoverTrigger, } from "./ui/popover";
import { RequestLoan, UseContractCoincred } from "@/constant/contracts";
import { useReadContract, useWriteContract } from "wagmi";
import { useAccount } from "wagmi";
import { Progress } from "./ui/progress"
    

const LoanUserRequests = () => {
    const account = useAccount()
    const [isApproving,setApproving] = useState<boolean>(false);
    const {approve,createRequest,getAllRequest,getAllUserLoanRequests,RepayLoan} =UseContractCoincred();

    //write
    const { writeContractAsync:repayloan } = useWriteContract()

    const handleRepay =async(loanId:number)=>{
       
            setApproving(true)

        try{
            const repay = RepayLoan(loanId);
            const tx = await repayloan({ 
                abi:repay.abi,
                address: repay.address,
                functionName: repay.functionName,
                args:repay.args,
             })
             if(tx){
                setApproving(false)
             }else{
                setApproving(false)
             }

        }catch(err){
            console.log(err)
            setApproving(false)
        }
    }

  //read contracts
  const getAllTheRequests = getAllUserLoanRequests(account.address)
  const result = useReadContract({
    abi: getAllTheRequests.abi,
    address: getAllTheRequests.address,
    functionName: getAllTheRequests.functionName,
    args:getAllTheRequests.args
    
  })
  console.log("the result is resulting",result.data)
  const dataArray:RequestLoan[] = Array.isArray(result.data) ? result.data : [];
    return (
        <div className="w-full max-h-screen ">
            <div className="h-screen w-full grid">
          
           
               
                <ScrollArea className="h-3/4 w-full  ">
                <div className="flex w-full h-full justify-center items-center ">
                
                <AlertDialog open={isApproving}>
      <AlertDialogTrigger asChild >
        
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Paying ...</AlertDialogTitle>
          <AlertDialogDescription>
          <Progress color="green" value={95}  />
          </AlertDialogDescription>
        </AlertDialogHeader>
        
      </AlertDialogContent>
    </AlertDialog>

                </div>
               
      <div className="p-4 gap-4 grid grid-cols-2">
       
        {dataArray.map((item, index) => (
                        <Card className="mb-4" key={index}>
                            <div className="flex justify-evenly items-center">
                            <CardHeader>
                                
                               
                                <div className="flex flex-col gap-2">
                                <CardTitle>Token to pay</CardTitle>
                                <h4>{Number(formatEther(item.tokenAmount)) + Number(formatEther(item.tokenProfit))}USDC</h4>
                                
                                {/* <h4>{item.TokenAmount + item.TokenProfit}USDC</h4> */}

                                </div>
                                <div className="flex flex-col gap-2">
                                <CardTitle>Token to Acquire</CardTitle>
                                
                                <h4>{Number(formatEther(item.collatrealAmount))}LISK</h4>

                                </div>
                            </CardHeader>

                            <div className="flex flex-col gap-2">
                                <CardTitle>STATUS</CardTitle>
                                
                                <h4>{item.lendOut? <Badge variant="active">active</Badge> : <Badge variant="inactive">inactive</Badge>}</h4>

                                </div>
                           

                            </div>

                            <CardContent>
                            <div className="flex  justify-end items-center">
                                

                                <Button onClick={()=>handleRepay(index)}  variant="accent">PAY</Button>

                            </div>
                               
                            </CardContent>
                           
                        </Card>
                    ))}
      </div>
      
    </ScrollArea>
    </div>
    
            {/* </div> */}
           
        </div>
    );
}

export default LoanUserRequests;
