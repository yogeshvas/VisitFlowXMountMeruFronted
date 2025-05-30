import { axiosInstance } from "./api";

export const addReview = async (client:string, user:string, review:string, rating:string)=> {
    const response = await axiosInstance.post('/reviews', {
        client,
        user,
        review,
        rating
    });
    return response.data;
}


export const myReviews = async(limit:number,page:number)=> {
    const response = await axiosInstance.get(`/reviews/my-reviews?limit=${limit}&page=${page}`);
    return response.data;
}