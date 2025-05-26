export default function ImageDetail({ params }) {
  const { id } = params;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Photo ID: {id}</h1>
      <img src={`/api/photos/${id}/medium`} alt={`Photo ${id}`} />
    </div>
  );
}