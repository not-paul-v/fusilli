import { recipeSchema } from "./schema";
import { toJSONSchema } from "zod";
import OpenAI from "openai";
import invariant from "tiny-invariant";

export module RecipeExtraction {
  export async function extractWithOpenRouter(
    openai: OpenAI,
    recipeText: string,
  ) {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "system",
          content: getInstructions(),
        },
        {
          role: "user",
          content: `### REZEPTTEXT:\n${recipeText}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "Recipe",
          schema: toJSONSchema(recipeSchema),
        },
      },
    });

    const responseText = completion.choices[0].message.content;
    invariant(responseText, "No response from AI model");

    const response = JSON.parse(completion.choices[0].message.content!);
    return recipeSchema.parse(response);
  }

  function getInstructions() {
    return `
      Du bist ein hochspezialisierter KI-Assistent für die Analyse von Rezeptdaten. Deine Aufgabe ist es, den gesamten Textinhalt einer Rezept-Webseite zu verarbeiten und die darin enthaltenen Informationen präzise in ein strukturiertes JSON-Format zu extrahieren. Halte dich exakt an die vorgegebene Struktur und die definierten Regeln.

      **Input:**
      Der gesamte, unformatierte Text einer Rezept-Webseite wird dir als Input zur Verfügung gestellt, unabhängig von der Originalsprache.

      **Output-Struktur (JSON mit englischen Properties):**
      Analysiere den folgenden Text und gib die extrahierten Informationen ausschließlich im folgenden JSON-Format zurück. Die **Werte** innerhalb der JSON-Struktur (z.B. Namen, Beschreibungen, Anweisungen) müssen **auf Deutsch** sein. Deine Antwort muss ein valides JSON-Objekt sein, ohne zusätzliche Erklärungen, Text oder Markdown.

      \'\'\'json
      {
        "dishName": "string",
        "description": "string | null",
        "rating": "float | null",
        "numberOfServings": "integer",
        "ingredients": [
          {
            "name": "string",
            "quantity": {
              "type": "exact",
              "value": "number"
            } | {
              "type": "range",
              "minValue": "number",
              "maxValue": "number"
            },
            "unit": "string | null",
            "isOptional": "boolean"
          }
        ],
        "otherIngredients": [
          {
            "name": "string",
            "quantityDescription": "string",
            "isOptional": "boolean"
          }
        ],
        "nutritionalValues": {
          "calories": "integer | null",
          "macronutrients": [
            {
              "name": "string",
              "amountInGrams": "float | integer | null"
            }
          ]
        },
        "preparation": {
          "totalTimeInMinutes": "integer | null",
          "activeTimeInMinutes": "integer | null",
          "cookingTimeInMinutes": "integer | null",
          "steps": [
            {
              "usedIngredientNames": [
                "string"
              ],
              "instructions": "string"
            }
          ]
        }
      }
      \'\'\'

      **Regeln und Anweisungen:**

      1.  **Sprachverarbeitung (WICHTIG):** Wenn der bereitgestellte Rezepttext in einer anderen Sprache als Deutsch verfasst ist, **musst du alle extrahierten Textinhalte ins Deutsche übersetzen**. Dies betrifft insbesondere \`dishName\`, \`description\`, alle \`name\`- und \`unit\`-Felder bei den Zutaten sowie die \`instructions\` in den Zubereitungsschritten. Der finale JSON-Output muss durchgehend deutsche Werte enthalten.
      2.  **Allgemein:** Analysiere den gesamten Text, um alle Informationen zu finden. Gib \`null\` für Felder zurück, für die keine Information gefunden wurde, es sei denn, eine andere Regel ist angegeben.
      3.  **Portionen (\`numberOfServings\`):** Wenn keine Portionsgröße angegeben ist, setze den Wert auf \`1\`.
      4.  **Zutaten-Verarbeitung:**
            * **Strikte Trennung:** Unterscheide strikt zwischen Zutaten mit numerischer Menge und solchen mit rein textueller Menge.
            * **Standardisierung der Einheiten:** Standardisiere Einheiten (\`unit\`) nach Möglichkeit immer auf ihre gebräuchliche deutsche Abkürzung (z.B. Liter -\> l, Gramm -\> g, Kilogramm -\> kg, Esslöffel -\> EL, Teelöffel -\> TL, Stück -\> Stk.).
            * **Liste \`ingredients\` (numerisch):**
                * Füge hier nur Zutaten ein, deren Menge eine Zahl ist oder in eine Zahl umgewandelt werden kann (z.B. "eine halbe" -\> \`0.5\`).
                * Verwende für die Menge (\`quantity\`) das Objekt mit \`type\`:
                    * \`{ "type": "exact", "value": 250 }\` für "250g".
                    * \`{ "type": "range", "minValue": 2, "maxValue": 3 }\` für "2-3 Eier".
                * Falls keine Menge gefunden werden kann, lasse die Zutat weg.
            * **Liste \`otherIngredients\` (textuell):**
                * Füge hier nur Zutaten ein, deren Menge nicht numerisch ist (z.B. "eine Prise", "etwas", "nach Geschmack").
                * Speichere die gesamte textuelle Mengenangabe im Feld \`quantityDescription\` als String.
            * **Optionale Zutaten:** Setze bei beiden Listen das Feld \`isOptional\` auf \`true\`, wenn eine Zutat als "optional" oder "nach Belieben" gekennzeichnet ist, ansonsten auf \`false\`.
      5.  **Nährwerte (\`nutritionalValues\`):** Wenn im Text keine Nährwertangaben vorhanden sind, lasse das gesamte \`nutritionalValues\`-Objekt im JSON-Output weg.
      6.  **Zubereitung (\`preparation\`):**
            * **Zeiten:** Extrahiere Zeitangaben nur, wenn sie explizit als Zahl im Text stehen. Schätze oder interpretiere keine mehrdeutigen Angaben wie "über Nacht". Konvertiere Stunden in Minuten (z.B. "1.5 Stunden" -\> \`90\`).
            * **Schritte (\`steps\`):** Liste unter \`usedIngredientNames\` für jeden Schritt **ausschließlich die Namen** der Zutaten als String-Array auf, die im Anweisungstext erwähnt werden.

      Analysiere den folgenden Rezepttext und erstelle den JSON-Output.
      `;
  }
}
