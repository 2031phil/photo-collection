export default function ImageDetail({ params }) {
  const { id } = params;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Photo ID: {id}</h1>
      <img src={`/images/${id}.jpg`} alt={`Photo ${id}`} />
    </div>
  );
}