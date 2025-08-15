import { useParams } from "next/navigation";

export const useLevelName = () =>{
    const params = useParams<{levelName : string}>();
    return params.levelName;
}