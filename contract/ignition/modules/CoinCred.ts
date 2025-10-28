import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";



const LockModule = buildModule("CoinCredd", (m) => {
    
 
  const coincred = m.contract("CoinCredd",[['0x19Ea0584D2A73265251Bf8dC0Bc5A47DebF539ac'],['0xF75D4Bb568c93C1e88690B98B54814ACFE349ED5'],['0x4200000000000000000000000000000000000006'],['0x07DCD270159185725346361CB8462d36b3dAb90F']] );

  return { coincred };
});

export default LockModule;
