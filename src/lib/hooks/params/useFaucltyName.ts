import { useParams } from "next/navigation";

export const useFacultyName = () =>{
    const params = useParams<{facultyName : string}>();
    return params.facultyName;
}