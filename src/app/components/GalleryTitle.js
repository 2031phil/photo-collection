export default function GalleryTitle({ selectedPhotoId }) {
    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '2rem', transition: '.2s', opacity: selectedPhotoId ? '0' : '1'}}>
            <h1>2031's Photo Collection</h1>
        </div>
    );
}