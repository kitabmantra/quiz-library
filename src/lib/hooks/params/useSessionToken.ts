import { useParams } from "next/navigation";

export const useSessionToken = () =>{
    const params = useParams<{sessionToken : string}>();
    return params.sessionToken;
}   