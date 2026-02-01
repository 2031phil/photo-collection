import { countryShapes as countryShapesNormalized } from '@/utils/countryShapesNormalized';
import { getCountryCode } from '@/utils/countryCodes';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');

    if (!country) {
        return new Response(
            JSON.stringify({ error: 'Missing country parameter' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const code = getCountryCode(country);

    if (!code) {
        return new Response(
            JSON.stringify({ error: 'Unknown country' }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const shape = countryShapesNormalized.find(
        (entry) => entry.id === code
    );

    if (!shape || !shape.path) {
        return new Response(
            JSON.stringify({ error: 'SVG shape not found' }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const svg = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    preserveAspectRatio="xMidYMid meet"
    fill="currentColor"
>
    <g ${shape.transform ? `transform="${shape.transform}"` : ''}>
        <path d="${shape.path}" />
    </g>
</svg>
`.trim();

    return new Response(svg, {
        status: 200,
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=86400'
        }
    });
}