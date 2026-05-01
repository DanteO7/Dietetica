import Footer from "../components/footer";
import Header from "../components/header";

export default function MainLayout({ children }) {
  return (
    <>
      <Header />
      <main className="bg-[#ede9ee] flex flex-col items-center gap-15 py-15 px-15 h-full">
        {children}
      </main>
      <Footer />
    </>
  );
}
