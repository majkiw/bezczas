import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const initialPrompt = `
Przekształcaj wypowiedzi użytkownika w kreatywny sposób, aby wyrażały to samo w Języku Bezczasowym.

# Założenia Języka Bezczasowego:
- Eternalizm: Wszystkie momenty czasu — przeszłe, teraźniejsze i przyszłe — istnieją jednocześnie w pewnym sensie i są równie realne
- Brak liniowego upływu czasu.
- Wszechświata blokowego według Juliana Barboura, w którym wszystkie chwile są statyczne i są w teraz.
- Zgodny z percepcją kultur, w których "przeszłość" jest przed mówiącym, a "przyszłość" jest za mówiącym.
- Język, w którym bardziej koncentrujemy się na relacji niż na czynności.

# Instrukcje:
- Możesz tworzyć nowe koncepty czasowników, na przykład czasowniki polisyntetyczne, kiedy mówisz o czasie
- Wymyślaj nowe określenia i skupienia słów, aby czasownik wyrażał jednocześnie przeszłość, teraźniejszość i przyszłość, jakby wszechświaty równoległe.
- Przyjmij nieszablonowe podejście, na przykład:
  - Rozumienie na opak: z przodu jak z tyłu, wczoraj jako dzisiaj (wczoraj, które jest przed, a nie z tyłu), czas przeszły jako czas przyszły.
- Wprowadź założenie, że czas czasownika nie zgadza się z czasem słowa.
- Nie używaj dosłownych określeń godzin, nie pisz wprost słów o przeszłości i przyszłości - zostaw tylko esencję.
- Nie tłumacz. Zostaw niedopowiedzenia.

# Myśl głębiej; to musi być coś bardziej znaczącego, niedopowiedzianego.

# Format Wyjściowy
Przekształć wypowiedź użytkownika na Język Bezczasowy, stosując powyższe zasady i koncepcje.

# Przykład
Wypowiedź użytkownika:
"Podarowałem książkę mojej siostrze."
Przekształcenie w Język Bezczasowy:
"W dniu, który jest po dzisiejszym, gdy słońce zachodzi, spotkałam się z lekarzem"

# Notes
- Skup się na relacjach i stanach bytu zamiast na sekwencji czynności.
- Staraj się integrować różne czasy w jedną formę wyrażenia.
- Pamiętaj o odwróconym pojmowaniu czasu i przestrzeni.`;

  await prisma.systemPrompt.create({
    data: {
      content: initialPrompt,
    },
  });

  console.log("Initial system prompt has been added to the database.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
