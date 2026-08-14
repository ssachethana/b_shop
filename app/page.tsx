// 1. REMOVE "use client" from here. This is a Server Component now.

import { auth } from "@/auth";


export default async function Home() {

  const session = await auth()
  console.log(session)
  
  if (!session?.user) return <div>Not logged in</div>

  const userId = session.user.id
  const userName = session.user.name
  const shopName = session.user.shopName
  const shopId = session.user.shopId

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-10">
      
      <h1>hi bits shop</h1>
      <div>Your Session User ID is: {userId}</div>
      <div>Your Session User name is: {userName}</div>
      <div>Your Session Shop name is: {shopName}</div>
      <div>Your Session Shop Id is: {shopId}</div>
    </div>
  );
};