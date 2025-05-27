export default function GalleryImage({ id }) {
    return (
        <img
            src={`/api/photos/${id}/small`}
            alt={`Photo ${id}`}
            style={{ width: '100%', aspectRatio: '1/1', borderRadius: '.5rem', cursor: 'pointer', objectFit: 'cover' }}
        />
    );
}