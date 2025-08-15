import { useParams } from "next/navigation";

export const useYearName = () =>{
    const params = useParams<{yearName : string}>();
    return params.yearName;
}