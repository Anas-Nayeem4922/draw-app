import Canvas from "@/components/Canvas";

export default async function Room({params} : {params: Promise<{roomId: string}>}) {
    const roomId = (await params).roomId;
    return <div>
        <Canvas roomId={roomId}/>
    </div>
}