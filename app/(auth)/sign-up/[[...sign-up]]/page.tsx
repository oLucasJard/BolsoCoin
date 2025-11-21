import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
            💰 BolsoCoin
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Central de Gerenciamento de Carteira
          </p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}

