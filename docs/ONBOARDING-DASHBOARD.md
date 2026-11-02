# Onboarding do Dashboard

O tour de boas-vindas usa o `driver.js` e está limitado à página inicial do
painel (`/admin`). Na primeira visita de cada utilizador, depois de os dados
do Dashboard carregarem, são apresentados os cartões, a atividade recente,
as ações rápidas e o atalho para ver o site. Se a opção de importação estiver
disponível, também é explicada.

## Utilização

- O tour começa automaticamente uma vez por utilizador e navegador.
- **Seguinte**, **Anterior**, **Concluir** e **Fechar** controlam o tour.
- **Conhecer o painel** no cabeçalho permite voltar a iniciá-lo.
- O estado fica em `localStorage`, associado ao ID do utilizador. Não é
  enviado para a API.

## Alterações do tour

1. Edite os passos em `src/admin/pages/Dashboard.tsx`, dentro de
   `startDashboardTour`.
2. Cada passo aponta para um elemento com `data-tour`. Ao adicionar um passo,
   coloque o atributo correspondente no elemento do Dashboard.
3. Para mostrar novamente o tour automaticamente a todos os utilizadores,
   altere a versão `v1` em `tourKey` para `v2`. A versão nova cria uma chave
   de progresso separada.
4. Execute `npm run build` para validar a compilação.

O progresso é local ao navegador. Para sincronizá-lo entre dispositivos ou
administrar versões no servidor, será necessário criar endpoints na API e
ligá-los ao modelo de progresso de onboarding.
