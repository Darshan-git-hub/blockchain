"use client"
import React from "react";
import {useState} from "react"
import { parseEther,formatEther } from "viem";
import { cn } from "@/lib/utils"
import { ScrollArea,ScrollBar } from "./ui/scroll-area";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import { Calendar } from "./ui/calendar"
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
    import { Progress } from "./ui/progress"
    import { useWriteContract,useReadContract } from 'wagmi'
    

import { UseContractCoincred } from "@/constant/contracts";
import { LiskSepoliaETH,Wusdc } from "@/constant/addresses/address";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { secondsFromNow } from "@/hooks/timeConversion";
import { RequestLoan } from "@/constant/contracts";
    

const LoanRequests = () => {
  const [isTransacting,setTransacting] = useState<boolean>(false);
  const [isApproving,setApproving] = useState<boolean>(false);
  const [send,setSend] = useState<boolean>(false);
  const [lendit,setLending] = useState<boolean>(false);
  const  [toggleprogress,setToggleprogress] = useState<boolean>(false)
  const [progress, setProgress] = useState(13)
  const [selectedOption, setSelectedOption] = useState(LiskSepoliaETH)
  const [selectedOptionToken, setSelectedOptionToken] = useState(Wusdc)
  const [profitToken, setTokenProfit] = useState("0")
  const [collateralToken, setTokenCollateral] = useState("0")
  const [borrowToken, setTokenBorrow] = useState("0")
  const [date, setDate] = useState<Date>();
  //write contracts
  const { writeContractAsync:approveToken } = useWriteContract()
  const { writeContractAsync:sendRequest } = useWriteContract()
  const { writeContractAsync:lendOutToken } = useWriteContract()
  const {approve,createRequest,getAllRequest,lendToken} =UseContractCoincred();

  //read contracts
  const getAllTheRequests = getAllRequest()
  const result = useReadContract({
    abi: getAllTheRequests.abi,
    address: getAllTheRequests.address,
    functionName: getAllTheRequests.functionName,
    args:getAllTheRequests.args
    
  })
  console.log("the result is resulting",result.data)
  const dataArray:RequestLoan[] = Array.isArray(result.data) ? result.data : [];
  

  
  
  const lendTokens = async(loanId:number)=>{
    const lend = lendToken(loanId)
    try{
      const tx = await lendOutToken({ 
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

     const txx =  await lendTokens(loanId);

     if(txx){
      setLending(false)
     }

     

     }
      
  
      
    } catch (err) {
      console.log(err);
      
      setApproving(false);
      setLending(false)
    }
  };

  const handleCreateRequest = async () => {
    
  
    try {
      if (!selectedOption || !selectedOptionToken || !borrowToken || !selectedOption || !profitToken || !date) {
        console.log("Some required values are missing.");
        return; // Exit the function if any value is missing
      }
      
      const requestCreate =  createRequest({_tokenRequest:selectedOptionToken,_tokenAmount:parseEther(borrowToken),_collateralAddress:selectedOption,_tokenProfit:parseEther(profitToken),duration:secondsFromNow(date),_value:parseEther(collateralToken)})
      console.log(selectedOption)
      console.log(selectedOptionToken)

      console.log(borrowToken)

      console.log(collateralToken)
      console.log(profitToken)
      console.log(secondsFromNow(date))



     

     
      
      const tx2 =await sendRequest({
        abi:requestCreate.abi,
        address: requestCreate.address,
        functionName: requestCreate.functionName,
        args:requestCreate.args,
        value:requestCreate.value
      })
      if(tx2){
        setTransacting(false)
      }

     
      
    } catch (err) {
      console.log(err);
      setTransacting(false);
      
    }
  };
    return (
        <div className="w-full max-h-screen grid grid-cols-4">
          
            <div className="col-span-3">
               
                <ScrollArea className="h-3/4 w-full ">
                <div className="flex w-full h-full justify-center items-center ">
                
                <AlertDialog open={isApproving}>
      <AlertDialogTrigger asChild >
        
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approving ...</AlertDialogTitle>
          <AlertDialogDescription>
          <Progress color="green" value={progress}  />
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
          <AlertDialogTitle>Lending Out ...</AlertDialogTitle>
          <AlertDialogDescription>
          <Progress color="green" value={88}  />
          </AlertDialogDescription>
        </AlertDialogHeader>
        
      </AlertDialogContent>
    </AlertDialog>

                </div>
                <div className="flex w-full h-1/2 justify-center items-center">
               

        
        <AlertDialog open={isTransacting}>
      <AlertDialogTrigger asChild >
        
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently Push your transaction onchain.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel  onClick={()=>setTransacting(false)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" >Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleCreateRequest} className="bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%" >Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
      </div>
     
      <div className="p-4 gap-4">
       
        {dataArray.map((item, index) => (
                        <Card className="mb-4" key={index}>
                            <div className="flex justify-evenly items-center">
                            <CardHeader>
                                <CardTitle>Collateral</CardTitle>
                                <CardDescription>LISK</CardDescription>
                                <div className="flex flex-col">
                                <p>Amount</p>
                                <h4>{Number(formatEther(item.collatrealAmount))}</h4>

                                </div>
                            </CardHeader>
                            <CardHeader>
                                <CardTitle>Token</CardTitle>
                                <CardDescription>USDC</CardDescription>
                                <div className="flex flex-col">
                                <p>Amount</p>
                                <h4>{Number(formatEther(item.tokenAmount))}</h4>

                                </div>
                            </CardHeader>
                            <CardHeader>
                                <CardTitle>Profit</CardTitle>
                                <CardDescription>USDC</CardDescription>
                                <div className="flex flex-col">
                                <p>Amount</p>
                                <h4>{ Number(formatEther(item.tokenProfit))}</h4>

                                </div>
                            </CardHeader>
                            <CardHeader>
                                <CardTitle>Borrower</CardTitle>
                                <CardDescription>{item.loanRequester}</CardDescription>
                            </CardHeader>

                            </div>

                            <CardContent>
                            <div className="flex  justify-end items-center">
                                {item.lendOut? <Button disabled={true} onClick={()=>handleApproveTransaction(index,item.tokenAmount)} variant="destructive">LENDED</Button>: <Button onClick={()=>handleApproveTransaction(index,item.tokenAmount)} variant="accent">LEND</Button>}

                                

                            </div>
                               
                            </CardContent>
                           
                        </Card>
                    ))}
      </div>
      
    </ScrollArea>
    
            </div>
            
            <div className="w-full h-full">
                <div  className="flex flex-col justify-between items-center gap-16 mx-5 rounded-xl h-96 bg-cardBackgroud">
                    <div className="flex flex-col h-full justify-evenly items-center">
                    <Label className="text-textColor" htmlFor="collateral">COLLATERAL TOKEN</Label>
                    <div className="flex justify-between items-center">
                    <Input  className=" bg-cardBackgroud m-4 text-textColor" onChange={(event) => setTokenCollateral(event.target.value)} type="text" placeholder="1 ETH" />
                    <Select  value={selectedOption}
  onValueChange={(value) => {
    setSelectedOption(value)
  }}>
<SelectTrigger className=" w-10  rounded-3xl mr-2 ">

</SelectTrigger>
<SelectContent>
<SelectGroup>
<SelectLabel>Collaterals</SelectLabel>
<SelectItem value={LiskSepoliaETH}>liskETH</SelectItem>
<SelectItem value="maticContract">MATIC</SelectItem>
<SelectItem value="ce">CELO</SelectItem>
<SelectItem value="grapes">LINK</SelectItem>
<SelectItem value="pineapple">BNB</SelectItem>
</SelectGroup>
</SelectContent>
</Select>

                    </div>
                    <div className="flex flex-col justify-center items-center gap-2">
                    <Label className="text-textColor" htmlFor="collateral">TOKEN BORROW</Label>
                    <div className="flex justify-between items-center">
                    <Input className=" bg-cardBackgroud m-4 text-textColor" onChange={(event) => setTokenBorrow(event.target.value)} type="text" placeholder="1 USDC" />
                    <Select value={selectedOptionToken}
  onValueChange={(value) => {
    setSelectedOptionToken(value)
  }}>
                    <SelectTrigger className=" w-10 rounded-3xl mr-2 ">

</SelectTrigger>
<SelectContent>
<SelectGroup>
<SelectLabel>Tokens</SelectLabel>
<SelectItem value={selectedOptionToken}>USDC</SelectItem>
<SelectItem value="banana">USDT</SelectItem>
<SelectItem value="blueberry">CUSDC</SelectItem>
<SelectItem value="grapes">DAI</SelectItem>
<SelectItem value="pineapple">UST</SelectItem>
</SelectGroup>
</SelectContent>
</Select>

                    </div>




                    </div>
                    <div className="flex flex-col justify-center items-center gap-2">
                      <div className="bg-cardBackground w-full">
                      <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left text-textColor font-normal bg-cardBackgroud",
            !date && "text-textColor"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
                      </div>
                    <Label className="text-textColor" htmlFor="collateral">TOKEN PROFIT</Label>
                    <div className="flex justify-between items-center">
                    <Input onChange={(event) => setTokenProfit(event.target.value)} className="bg-cardBackgroud text-textColor" type="text" placeholder="1 USDC" />

                    
                    </div>




                    </div>

                    <div className="w-full ">
                      <Button onClick={()=>setTransacting(true)} variant="accent" className="w-full">REQUEST</Button>
                       
                    </div>




                    </div>
                   

                </div>

            </div>
        </div>
    );
}

export default LoanRequests;
