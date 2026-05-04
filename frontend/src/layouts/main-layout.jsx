import Footer from "../components/footer";
import Header from "../components/header";

export default function MainLayout({ children }) {
  return (
    <div className="h-screen flex flex-col">
      <Header />

      <main className="bg-[#ede9ee] flex-1 overflow-y-auto flex flex-col items-center gap-15 py-15 px-15">
        {children}
      </main>

      <Footer />
    </div>
  );
}
