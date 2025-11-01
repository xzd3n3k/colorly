import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import {Toaster} from "react-hot-toast";

const App = () => (
    <BrowserRouter>
        <Toaster position="bottom-right" />
        <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    </BrowserRouter>
);

export default App;
