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
      
    
      import { RequestLoan, UseContractCoincred } from "@/constant/contracts";
      import { useReadContract, useWriteContract } from "wagmi";
      import { useAccount } from "wagmi";
      import { Progress } from "./ui/progress"
import { formatEther } from "viem";
const Faucet = () => {
    const account = useAccount()
    const [isApproving,setApproving] = useState<boolean>(false);
    const [userAddress, setUserAddress] = useState<`0x${string}`>()
   
    const [lendit,setLending] = useState<boolean>(false);
    const {approve,createRequest,getAllRequest,getCurrentBlockTimeStamp,getAllUserLoanRequests,RepayLoan,getAllLenderRequest,liquidate,mint} =UseContractCoincred();
   
    const { writeContractAsync:approveToken } = useWriteContract()
    

    


  

  const handleApproveTransaction = async () => {
    setApproving(true);
  
    try {
      const apptoken = mint(userAddress);
     
      



      const tx = await approveToken({ 
        abi:apptoken.abi,
        address: apptoken.address,
        functionName: apptoken.functionName,
        args:apptoken.args,
     })

     if(tx){
      setApproving(false);
     
      }

     

     
      
  
      
    } catch (err) {
      console.log(err);
      
      setApproving(false);
      
    }
  };
    return (
        <div className="w-full max-h-screen ">
            <div className="h-screen w-full grid">
          
           
               
                <ScrollArea className="h-full w-full  ">
                <div className="flex w-full h-full justify-center items-center ">
                
                <AlertDialog open={isApproving}>
      <AlertDialogTrigger asChild >
        
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Minting ...</AlertDialogTitle>
          <AlertDialogDescription>
          <Progress color="green" value={77}  />
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
          <AlertDialogTitle>Claiming  ...</AlertDialogTitle>
          <AlertDialogDescription>
          <Progress color="green" value={88}  />
          </AlertDialogDescription>
        </AlertDialogHeader>
        
      </AlertDialogContent>
    </AlertDialog>

                </div>
               
      <div className="flex justify-center h-full w-full items-center">
       
        
                        <Card className="mb-4 w-1/2 h-1/2 flex flex-col justify-between" >
                            <div className="flex justify-evenly items-center">
                            <CardHeader>
                            <div className="flex flex-col gap-1">
                                <CardTitle className="text-sm">GET WUSDC TESTNET</CardTitle>
                               
                                
                                
                               
                                

                                </div>
                               
                                <div className="flex flex-col gap-1">
                                <CardTitle className="text-sm">Receive Address</CardTitle>
                                
                               

                                </div>
                                
                                <CardTitle className="text-sm w-full"> <Input className=" w-full bg-cardBackgroud m-4 text-textColor" onChange={(event) => setUserAddress(event.target.value as `0x${string}`)} type="text" placeholder="0x656368742752...5376738" /></CardTitle>
                                
                             

                               
                               
                            </CardHeader>

                           
                           

                            </div>

                            <CardContent>
                            <div className="flex  justify-end items-center">
                            
                              <Button  onClick={()=> handleApproveTransaction()} variant="destructive">Faucet</Button>
                                

                                

                            </div>
                               
                            </CardContent>
                           
                        </Card>
                    
      </div>
      
    </ScrollArea>
    </div>
    
            {/* </div> */}
           
        </div>
    );
}

export default Faucet;
