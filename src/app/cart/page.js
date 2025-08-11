import MyBagPage from "../pages/my_bag";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


export default function AppPage() {
  return (
    <div>
      <Navbar/>
      <MyBagPage /> {/* Rendering the Home component */}
      <Footer/>
    </div>
  );
}
