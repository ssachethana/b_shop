
import CreateProductForm from "@/app/components/CreateProductForm";





export default async function page() {

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-10">
      {/* 3. Pass the data as props and use the correct tag syntax */}
      <CreateProductForm/>
    </div>
  );
};