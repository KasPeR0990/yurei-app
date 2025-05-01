import { useState } from 'react';

interface FeedbackProps {
  title: string;
  description: string;
  onSubmit: (value: string) => void;
}

const Feedback: React.FC<FeedbackProps> = ({ title, description, onSubmit }) => {
  const [feedback, setFeedback] = useState('');

  return (
    <div className="feedback-container">
      <h3>{title}</h3>
      <p>{description}</p>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Your feedback..."
      />
      <button onClick={() => onSubmit(feedback)}>Submit</button>
    </div>
  );
};

export default Feedback;