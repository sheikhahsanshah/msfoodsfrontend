import LoginPage from "@/app/Component/Login";
import Footer from "../../Component/Footer";
import Header from "@/app/Component/Header";

export default function Home() {
    return (
        <div className="bg-light">  
            <Header/>
            <LoginPage/>
            <Footer/>
        </div>
    );
}
