import Contact from "../Component/Contact";
import Footer from "../Component/Footer";
import Header from "@/app/Component/Header";

export default function Home() {
    return (
        <div className="bg-light">  
            <Header/>
            <Contact/>
            <Footer/>
        </div>
    );
}
