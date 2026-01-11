import Divder from "@/components/divider/Divder";
import formatDate from "@/lib/functions/dateFormat";
import { ReviewData } from "@/types/Review";
import Stars from "./Stars";

interface ReviewListProps {
  data: ReviewData[] | undefined;
}

const ReviewList = ({ data }: ReviewListProps) => {
  return (
    <div className="my-15">
      {data?.map((review) => (
        <div key={review.id}>
          <p className="text-black02 mb-2.5 text-lg">
            {review.user.name} <span className="text-gray01">| {formatDate(review.createdAt)}</span>
          </p>
          <Stars
            rating={review.rating}
            size="medium"
          />
          <p className="my-7.5">{review.content}</p>
          <Divder className="my-7.5" />
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
