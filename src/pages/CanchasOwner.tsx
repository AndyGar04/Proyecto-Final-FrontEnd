import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Sidebar } from "../components/layout/Sidebar";
import { Footer } from "../components/layout/Footer";
import { 
    Trash2, Plus, ArrowLeft, Loader2,
    Trophy, Users, 
    Activity, ChevronRight, CircleDot
} from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import { clubApi, type Club, type Cancha } from "../api/clubApi";

interface ModalState {
    open: boolean;
    modo: "add";
    data: Cancha;
}

const initialCanchaState: Cancha = {
    id: "",
    nombreCancha: "",
    deporte: "Fútbol",
    tamanio: "",
    turno: { id: "", descripcionTurno: "Alquiler 60 min", costo: 0, horarios: [] }
};

export function CanchasOwner() {
    const { clubId } = useParams<{ clubId: string }>(); //
    const navigate = useNavigate();
    const [club, setClub] = useState<Club | null>(null);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<ModalState>({ open: false, modo: "add", data: initialCanchaState });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const cargarDatos = async () => {
        if (!clubId) return;
        try {
            const data = await clubApi.getById(clubId); //
            setClub(data);
        } catch (error) { 
            console.error(error); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { cargarDatos(); }, [clubId]);

    const eliminarCancha = async (id: string) => {
        if (!window.confirm("¿Eliminar esta cancha y todos sus horarios?")) return;
        try {
            await clubApi.deleteCancha(clubId!, id); //
            await cargarDatos();
        } catch (error) { 
            alert("Error al eliminar: " + error); 
        }
    };

    const getSportIcon = (deporte: string) => {
        switch(deporte.toLowerCase()){
            case 'tenis': return <CircleDot className="text-yellow-500" />;
            case 'padel': return <Activity className="text-emerald-500" />;
            default: return <Trophy className="text-blue-500" />;
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950">
            <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
    );

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        if (!clubId) return;

        const cleanClubId = clubId.startsWith(':') ? clubId.slice(1) : clubId;

        setIsSubmitting(true);
        try {
            const payload = {
                nombreCancha: modal.data.nombreCancha,
                deporte: modal.data.deporte,
                tamanio: modal.data.tamanio,
                descripcionTurno: modal.data.turno.descripcionTurno,
                costo: modal.data.turno.costo,
            };

            await clubApi.addCanchaConTurno(cleanClubId, crypto.randomUUID(), payload);
            
            await cargarDatos();
            setModal({ open: false, modo: "add", data: initialCanchaState });
        } catch (error) {
            // Si sigue fallando, este alert nos va a decir qué ID está viajando
            alert(`Error en Club ${cleanClubId}: ${error}`);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-300">
            <Navbar />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-6 lg:p-10 flex flex-col gap-8">
                    
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <button 
                                onClick={() => navigate(`/home-owner/${clubId}`)} // Regresa a su home específico
                                className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:gap-3 transition-all"
                            >
                                <ArrowLeft size={16} /> Volver al Panel
                            </button>
                            <h1 className="text-4xl font-black text-slate-800 dark:text-white uppercase italic">
                                Canchas: <span className="text-blue-600">{club?.nombreClub}</span>
                            </h1>
                        </div>
                        <button 
                            onClick={() => setModal({ open: true, modo: "add", data: initialCanchaState })}
                            className="relative z-10 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-8 py-4 rounded-2xl shadow-xl transition-all flex items-center gap-3 font-bold uppercase text-xs tracking-widest"
                            >
                            <Plus size={24} /> 
                            <span>Nueva Cancha</span>
                        </button>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {club?.canchas?.map((cancha) => (
                            <div key={cancha.id} className="group bg-white dark:bg-gray-900 rounded-[2.5rem] border border-slate-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden">
                                <div className="p-8 flex-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-4 bg-slate-50 dark:bg-gray-800 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            {getSportIcon(cancha.deporte)}
                                        </div>
                                        <button onClick={() => eliminarCancha(cancha.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 italic uppercase">{cancha.nombreCancha}</h3>
                                    <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm font-medium mb-8 uppercase tracking-widest">
                                        <span className="bg-slate-100 dark:bg-gray-800 px-3 py-1 rounded-full text-[10px] font-black">{cancha.deporte}</span>
                                        <span className="flex items-center gap-1.5 italic"><Users size={14}/> {cancha.tamanio}</span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-gray-800/50 rounded-3xl p-5 border border-slate-100 dark:border-gray-700/50">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase">Turno Base</p>
                                                <p className="font-bold text-slate-700 dark:text-slate-200">{cancha.turno?.descripcionTurno}</p>
                                            </div>
                                            <p className="text-2xl font-black text-emerald-600">${cancha.turno?.costo}</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/horarios-owner/${cancha.turno.id}`)} // Navega a horarios de dueño
                                    className="m-4 mt-0 py-4 bg-slate-100 dark:bg-gray-800 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-300 rounded-[1.8rem] flex items-center justify-center gap-3 font-bold transition-all group/btn uppercase text-[10px] tracking-widest"
                                >
                                    Configurar Agenda
                                    <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        ))}
                    </div>
                {modal.open && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                            <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-gray-800">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase italic">Nueva Cancha</h2>
                                    <button onClick={() => setModal({ ...modal, open: false })} className="text-slate-400 hover:text-red-500">✕</button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <input 
                                        required
                                        placeholder="Nombre de la cancha"
                                        className="w-full p-4 bg-slate-50 dark:bg-gray-800 rounded-2xl outline-none dark:text-white font-bold"
                                        value={modal.data.nombreCancha}
                                        onChange={e => setModal({...modal, data: {...modal.data, nombreCancha: e.target.value}})}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <select 
                                            className="p-4 bg-slate-50 dark:bg-gray-800 rounded-2xl font-bold dark:text-white"
                                            value={modal.data.deporte}
                                            onChange={e => setModal({...modal, data: {...modal.data, deporte: e.target.value}})}
                                        >
                                            <option value="Fútbol">Fútbol</option>
                                            <option value="Padel">Padel</option>
                                            <option value="Tenis">Tenis</option>
                                        </select>
                                        <input 
                                            required
                                            placeholder="Tamaño (Ej: 5 vs 5)"
                                            className="p-4 bg-slate-50 dark:bg-gray-800 rounded-2xl font-bold dark:text-white"
                                            value={modal.data.tamanio}
                                            onChange={e => setModal({...modal, data: {...modal.data, tamanio: e.target.value}})}
                                        />
                                    </div>
                                    <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] space-y-4">
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Turno Base</p>
                                        <input 
                                            required
                                            placeholder="Descripción del turno"
                                            className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl font-bold"
                                            value={modal.data.turno.descripcionTurno}
                                            onChange={e => setModal({...modal, data: {...modal.data, turno: {...modal.data.turno, descripcionTurno: e.target.value}}})}
                                        />
                                        <input 
                                            required
                                            type="number"
                                            placeholder="Precio"
                                            className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl font-black text-emerald-600 text-xl"
                                            value={modal.data.turno.costo}
                                            onChange={e => setModal({...modal, data: {...modal.data, turno: {...modal.data.turno, costo: Number(e.target.value)}}})}
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all"
                                    >
                                        {isSubmitting ? "GUARDANDO..." : "CONFIRMAR REGISTRO"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
}