import { useParams } from "next/navigation";

export const useEntranceName = () =>{
    const params = useParams<{entranceName : string}>();
    return params.entranceName;
}   