import { useState, useEffect } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AnchorProvider, web3, Program, BN } from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import idl from '../idl/tipping_app.json';

interface TipJarData {
  owner: PublicKey;
  totalTips: number;
  createdAt: number;
}

const PROGRAM_ID = new PublicKey('6JxyCFracCZ6ydBYQcZNB3aFJmvi8fgSVGHcTQerNyYo');

export default function TippingApp() {
  const wallet = useWallet();
  const [connection] = useState(new Connection('https://api.devnet.solana.com', 'confirmed'));
  const [program, setProgram] = useState<Program | null>(null);
  const [tipJarData, setTipJarData] = useState<TipJarData | null>(null);
  const [tipJarPda, setTipJarPda] = useState<PublicKey | null>(null);
  const [tipAmount, setTipAmount] = useState<string>('0.1');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('0.1');
  const [loading, setLoading] = useState<string>('');

  useEffect(() => {
    if (wallet?.publicKey && wallet.signTransaction) {
      const provider = new AnchorProvider(connection, wallet as any, {});
      const program = new Program(idl as any, provider);
      setProgram(program);

      // Calculate tip jar PDA
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('tip_jar'), wallet.publicKey.toBuffer()],
        PROGRAM_ID
      );
      setTipJarPda(pda);
    } else {
      setProgram(null);
      setTipJarPda(null);
      setTipJarData(null);
    }
  }, [wallet?.publicKey, wallet?.signTransaction, connection]);

  useEffect(() => {
    if (program && tipJarPda) {
      fetchTipJarData();
    }
  }, [program, tipJarPda]);

  const fetchTipJarData = async () => {
    if (!program || !tipJarPda) return;

    try {
      const tipJarAccount = await (program.account as any).tipJar.fetch(tipJarPda);
      setTipJarData({
        owner: tipJarAccount.owner as PublicKey,
        totalTips: (tipJarAccount.totalTips as BN).toNumber() / LAMPORTS_PER_SOL,
        createdAt: (tipJarAccount.createdAt as BN).toNumber()
      });
    } catch (error) {
      console.log('Tip jar not found:', error);
      setTipJarData(null);
    }
  };

  const initializeTipJar = async () => {
    if (!program || !wallet.publicKey || !tipJarPda) return;

    setLoading('Initializing tip jar...');
    try {
      const tx = await program.methods
        .initializeTipJar()
        .accounts({
          tipJar: tipJarPda,
          owner: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      console.log('Initialize tip jar transaction:', tx);
      await fetchTipJarData();
    } catch (error) {
      console.error('Error initializing tip jar:', error);
    } finally {
      setLoading('');
    }
  };

  const sendTip = async (recipientPublicKey: string) => {
    if (!program || !wallet.publicKey) return;

    setLoading('Sending tip...');
    try {
      const recipient = new PublicKey(recipientPublicKey);
      const [recipientTipJarPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('tip_jar'), recipient.toBuffer()],
        PROGRAM_ID
      );

      const amount = new BN(parseFloat(tipAmount) * LAMPORTS_PER_SOL);

      const tx = await program.methods
        .sendTip(amount)
        .accounts({
          tipJar: recipientTipJarPda,
          tipper: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      console.log('Send tip transaction:', tx);
    } catch (error) {
      console.error('Error sending tip:', error);
    } finally {
      setLoading('');
    }
  };

  const withdrawTips = async () => {
    if (!program || !wallet.publicKey || !tipJarPda) return;

    setLoading('Withdrawing tips...');
    try {
      const amount = new BN(parseFloat(withdrawAmount) * LAMPORTS_PER_SOL);

      const tx = await program.methods
        .withdrawTips(amount)
        .accounts({
          tipJar: tipJarPda,
          owner: wallet.publicKey,
        })
        .rpc();

      console.log('Withdraw tips transaction:', tx);
      await fetchTipJarData();
    } catch (error) {
      console.error('Error withdrawing tips:', error);
    } finally {
      setLoading('');
    }
  };

  if (!wallet.connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Solana Tipping App</h1>
        <p className="text-lg text-gray-600">Please connect your wallet to continue</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-white">Solana Tipping App</h1>
      
      {/* Tip Jar Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Your Tip Jar</h2>
        
        {tipJarData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">Total Tips Received</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{tipJarData.totalTips.toFixed(4)} SOL</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">Created</p>
                <p className="text-lg text-blue-700 dark:text-blue-300">
                  {new Date(tipJarData.createdAt * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {/* Withdraw Section */}
            <div className="border-t dark:border-gray-600 pt-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Withdraw Tips</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder="Amount in SOL"
                />
                <button
                  onClick={withdrawTips}
                  disabled={!!loading}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {loading === 'Withdrawing tips...' ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">You don't have a tip jar yet!</p>
            <button
              onClick={initializeTipJar}
              disabled={!!loading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading === 'Initializing tip jar...' ? 'Creating...' : 'Create Tip Jar'}
            </button>
          </div>
        )}
      </div>

      {/* Send Tips Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Send Tips</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Recipient Public Key
            </label>
            <input
              type="text"
              id="recipientKey"
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="Enter recipient's public key"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tip Amount (SOL)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="0.1"
            />
          </div>
          
          <button
            onClick={() => {
              const input = document.getElementById('recipientKey') as HTMLInputElement;
              if (input?.value) {
                sendTip(input.value);
              }
            }}
            disabled={!!loading}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading === 'Sending tip...' ? 'Processing...' : 'Send Tip'}
          </button>
        </div>
      </div>

      {/* Quick Tip to Yourself Section for Demo */}
      {wallet.publicKey && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Demo: Tip Yourself</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Your public key: {wallet.publicKey.toString()}</p>
          <button
            onClick={() => sendTip(wallet.publicKey!.toString())}
            disabled={!!loading}
            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading === 'Sending tip...' ? 'Processing...' : 'Demo: Tip Yourself'}
          </button>
        </div>
      )}
    </div>
  );
}