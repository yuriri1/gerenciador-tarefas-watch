// Importa o JSON diretamente (o ESBuild vai embutir o conteúdo automaticamente)
import swaggerSpec from './swagger.json' assert { type: 'json' };

export const swagger = async (event) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>API Docs</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js"></script>
        <script>
          window.onload = () => {
            window.ui = SwaggerUIBundle({
              spec: ${JSON.stringify(swaggerSpec)},
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              layout: "BaseLayout"
            });
          };
        </script>
      </body>
      </html>
    `;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: html,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Falha ao carregar a documentação.', details: error.message }),
    };
  }
};

export const serve = swagger;