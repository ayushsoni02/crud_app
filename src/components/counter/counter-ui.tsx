'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useCounterProgram, useCounterProgramAccount } from './counter-data-access'
import { ellipsify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

export function CounterCreate() {
  const [title,setTitle] = useState('');
  const [message,setMessage] = useState('');
  const {createEntry} = useCounterProgram();
  const {publicKey} = useWallet();

  const isFormValid = title.trim() !== '' && message.trim() !== '';

 const handleSubmit = () => {
  if (publicKey && isFormValid) {
    console.log("Submitting Entry:", { title, message, owner: publicKey.toBase58() });
    createEntry.mutateAsync({title,message,owner:publicKey});
  }
 };

 if(!publicKey){
  return <p>Connect Your Wallet</p>
 }

  return (
    <div>
      <input type="text"
      placeholder='Title'
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      className='input input-bordered w-full max-w-xs'
      />
      <textarea
      placeholder='Message'
      value={message}
      onChange={(e)=> setMessage(e.target.value)}
      className='textarea textarea-bordered w-full max-w-xs'
      />
      <button
      type='submit'
      onClick={handleSubmit}
      disabled={createEntry.isPending || !isFormValid}
      className='btn btn-xs lg:btn-md btn-primary hover:cursor-pointer border-2 border-primary'
      >Create Journal Entry</button>
    </div>
  )
}

export function CounterList() {
  const { accounts, getProgramAccount } = useCounterProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <CounterCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function CounterCard({ account }: { account: PublicKey }) {
  const { accountQuery,updateEnrty,deleteEntry} = useCounterProgramAccount({
    account,
  });

  const {publicKey} = useWallet();
  const [message,setMessage] = useState('');
  const title = accountQuery.data?.title;

  const isFormValid = message.trim() !== '';

  const handleSubmit = () => {
    if(publicKey && isFormValid && title){
      updateEnrty.mutateAsync({title,message,owner:publicKey});
    }
  };

  if(!publicKey){
    return <p>Connect Your Wallet</p>
  }

  return accountQuery.isLoading ? ( 
  <span className="loading loading-spinner loading-lg"></span>) : (
    <div className='card card-bordered border-base-300 border-4 text-neutral-content'>
      <div className='card-body items-center text-center'>
        <div className='space-y-6'>
        <h2 className='card-title justify-center text-3xl cursor-pointer'
        onClick={()=> accountQuery.refetch()}
        >{accountQuery.data?.title}
        </h2>
        <p>{accountQuery.data?.message}</p>
        <div className='card-actions justify-around'>
          <textarea
           placeholder='Message'
           value={message}
           onChange={(e)=> setMessage(e.target.value)}
           className='textarea textarea-bordered w-full max-xs'
          />
          <button 
          onClick={handleSubmit}
          disabled={updateEnrty.isPending || !isFormValid}
          className='btn btn-xs lg:btn-md btn-primary'
          >Update Journal Entry</button>
          <button
          onClick={()=> {
            const title = accountQuery.data?.title;
           if(title){
            return deleteEntry.mutateAsync(title);
           }
          }
          }
          disabled={deleteEntry.isPending}
          className="btn btn-xs lg:btn-md btn-error"
          >Delete
          </button>
        </div>
        </div>
      </div>
    </div>
  )
 
}
