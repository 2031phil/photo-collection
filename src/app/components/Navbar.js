export default function Navbar() {
    return (
        <nav style={{ width: '100vw', display: 'flex', padding: '4rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <img id="logo" src="/logo.png" alt="Site Logo" style={{ width: '4rem' }} />
            <div style={{ display: 'flex', gap: '1rem' }}>
                <a>Free Usage Policy</a>
                <a>About me</a>
            </div>
        </nav>
    )
}