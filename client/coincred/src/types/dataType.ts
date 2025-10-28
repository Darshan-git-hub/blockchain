export interface LoanRequest {
    CollateralAmount: number;
    TokenAmount: number;
    TokenProfit: number;
    BorrowerAddress: string;
   
    startTime:number;
    endTime:number;
    status:boolean;
}