
// CAMV LIVE Casino - Mines Game (React + Ethers.js on Sepolia Testnet)
// Frontend file - App.jsx

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";

const GRID_SIZE = 5;
const ETH_RECEIVER = "0x154ecbdCa880190A91cfe695bEbCa562050Fb1Cb";
const MINE_COUNT = 5; // Can be dynamic later

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [grid, setGrid] = useState([]);
  const [mines, setMines] = useState(new Set());
  const [revealed, setRevealed] = useState(new Set());
  const [status, setStatus] = useState("");
  const [betAmount, setBetAmount] = useState("0.01");

  useEffect(() => {
    if (!provider && window.ethereum) {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(newProvider);
    }
  }, []);

  const connectWallet = async () => {
    if (!provider) return;
    const signer = await provider.getSigner();
    setSigner(signer);
    const address = await signer.getAddress();
    setAccount(address);
  };

  const startGame = () => {
    const mineSet = new Set();
    while (mineSet.size < MINE_COUNT) {
      mineSet.add(Math.floor(Math.random() * GRID_SIZE * GRID_SIZE));
    }
    setMines(mineSet);
    setRevealed(new Set());
    setGrid(Array(GRID_SIZE * GRID_SIZE).fill(""));
    setStatus("Playing");
  };

  const revealTile = (i) => {
    if (mines.has(i)) {
      setStatus("Boom! You hit a mine.");
      setRevealed(new Set([...Array(GRID_SIZE * GRID_SIZE).keys()]));
    } else {
      const newSet = new Set(revealed);
      newSet.add(i);
      setRevealed(newSet);
      setStatus(`Safe! ${newSet.size} tiles revealed.`);
    }
  };

  const sendBet = async () => {
    if (!signer) return;
    const tx = await signer.sendTransaction({
      to: ETH_RECEIVER,
      value: ethers.parseEther(betAmount),
    });
    await tx.wait();
    startGame();
  };

  return (
    <div className="p-4 text-center">
      <img src="/coin.png" alt="logo" className="mx-auto w-12 h-12 mb-2" />
      <h1 className="text-2xl font-bold mb-2">CAMV LIVE Casino</h1>
      {account ? <p>Wallet: {account}</p> : <Button onClick={connectWallet}>Connect Wallet</Button>}

      <div className="my-2">
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          className="p-2 border rounded"
        /> ETH
        <Button className="ml-2" onClick={sendBet} disabled={!account}>Play</Button>
      </div>

      <p className="mb-4">{status}</p>

      <div className="grid grid-cols-5 gap-2 justify-center">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
          <button
            key={i}
            onClick={() => revealTile(i)}
            className={`w-12 h-12 rounded border ${revealed.has(i) ? (mines.has(i) ? "bg-red-500" : "bg-green-500") : "bg-gray-300"}`}
            disabled={revealed.has(i) || status !== "Playing"}
          >
            {revealed.has(i) ? (mines.has(i) ? "💣" : "✅") : ""}
          </button>
        ))}
      </div>
    </div>
  );
}
