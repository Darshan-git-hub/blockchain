
"use client"
import React, { useState } from "react";
import { ScrollArea,ScrollBar } from "./ui/scroll-area";
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
  
import { countdown } from "@/hooks/timeConversion";
import { parseEther,formatEther } from "viem";
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
    import { useWriteContract,useReadContract } from 'wagmi'
    import { RequestLoan } from "@/constant/contracts";
    import { UseContractCoincred } from "@/constant/contracts";
import { Progress } from "./ui/progress";
    

const LoanLiquidate = () => {
     const [isApproving,setApproving] = useState<boolean>(false);
     const [lendit,setLending] = useState<boolean>(false);
     //write
    const { writeContractAsync:liquidateUser } = useWriteContract()
    const { writeContractAsync:approveToken } = useWriteContract()

    const {approve,createRequest,getAllRequest,lendToken,getCurrentBlockTimeStamp,liquidate} =UseContractCoincred();
    const getAllTheRequests = getAllRequest()
    const currentBlockTime = getCurrentBlockTimeStamp()
    const result = useReadContract({
        abi: getAllTheRequests.abi,
        address: getAllTheRequests.address,
        functionName: getAllTheRequests.functionName,
        args:getAllTheRequests.args
        
      })

      const resulttime = useReadContract({
        abi: currentBlockTime.abi,
        address:currentBlockTime.address,
        functionName: currentBlockTime.functionName,
        args:currentBlockTime.args
        
      })
      const dataArray:RequestLoan[] = Array.isArray(result.data) ? result.data : [];
      const nowBlockTime: number = Number.isInteger(resulttime.data as number) ? resulttime.data as number : 0;
      console.log("new block",nowBlockTime)
      console.log("run run",Number(resulttime.data))

      
      const liquidateAndPay = async(loanId:number)=>{
        const lend = liquidate(loanId)
        try{
          const tx = await liquidateUser({ 
            abi:lend.abi,
            address: lend.address,
            functionName: lend.functionName,
            args:lend.args,
         })
    
         return true;
    
        }catch(err){
          console.log(err)
        }
      }

      const handleApproveTransaction = async (loanId:number,tokenAmount:BigInt) => {
        setApproving(true);
      
        try {
          const apptoken = approve(tokenAmount);
         
          // console.log(selectedOption)
          // console.log(selectedOptionToken)
    
          // console.log(borrowToken)
    
          // console.log(collateralToken)
          // console.log(profitToken)
          // console.log(secondsFromNow(date))
    
    
    
          const tx = await approveToken({ 
            abi:apptoken.abi,
            address: apptoken.address,
            functionName: apptoken.functionName,
            args:apptoken.args,
         })
    
         if(tx){
          setApproving(false);
          setLending(true);
    
         const txx =  await liquidateAndPay(loanId);
    
         if(txx){
          setLending(false)
         }else{
            setLending(false)
         }
    
         
    
         }
          
      
          
        } catch (err) {
          console.log(err);
          
          setApproving(false);
          setLending(false)
        }
      };
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
          <AlertDialogTitle>Approving ...</AlertDialogTitle>
          <AlertDialogDescription>
          <Progress color="green" value={66}  />
          </AlertDialogDescription>
        </AlertDialogHeader>
        
      </AlertDialogContent>
    </AlertDialog>

                </div>
                <div className="flex w-full h-full justify-center items-center ">
                
                <AlertDialog open={lendit}>
      <AlertDialogTrigger asChild >
        
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Liquidating  ...</AlertDialogTitle>
          <AlertDialogDescription>
          <Progress color="green" value={88}  />
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

                                </div>
                                <div className="flex flex-col gap-2">
                                <CardTitle>Token to Acquire</CardTitle>
                                
                                <h4>{Number(formatEther(item.collatrealAmount))}LISK</h4>

                                </div>
                            </CardHeader>

                            <div className="flex flex-col gap-2">
                                <CardTitle>PERIOD ENDS IN</CardTitle>
                               
                                
                                
                                <h4>{countdown(Number(item.duration),Number(resulttime.data))}</h4>
                                

                                </div>
                           

                            </div>

                            <CardContent>
                            <div className="flex  justify-end items-center">
                                

                                <Button  onClick={()=>handleApproveTransaction(index,(item.tokenAmount + item.tokenProfit))} variant="accent">LIQUIDATE</Button>

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

export default LoanLiquidate;
