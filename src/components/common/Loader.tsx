export default function Loader() {
    return (

        <div className="flex flex-col items-center justify-center h-screen w-full bg-black opacity-50 z-60 fixed top-0 left-0">
            <div className="flex flex-row gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 animate-bounce" style={{ transform: 'translateY(-10px)' }}></div>
                <div
                    className="w-4 h-4 rounded-full bg-red-500 animate-bounce [animation-delay:-.3s]"
                    style={{ transform: 'translateY(10px)' }}
                ></div>
                <div
                    className="w-4 h-4 rounded-full bg-red-500 animate-bounce [animation-delay:-.5s]"
                    style={{ transform: 'translateY(-10px)' }}
                ></div>
            </div>
        </div>
    );
}
