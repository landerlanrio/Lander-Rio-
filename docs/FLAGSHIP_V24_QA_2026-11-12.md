# LANDER RIO — Flagship v24.2: validação e correções | 12/11/2026

**Escopo técnico:** PR draft #4 contra `staging`, ambiente privado, sem merge, deploy, alteração do Supabase/HubSpot/Netlify, cobrança, mensagens ou dados reais.

## Evidência remota de código
- Workflow CI: [GitHub Actions #43252259210](https://github.com/landerlanrio/Lander-Rio-/actions/runs/43252259210) **success** sobre commit `27012b26f23ac83dd99ccbb47667bfa6fb86dfdd`.
- Gates presentes no CI: `scripts/verify_site.py` (SHA-256 base+overlay, links e manifesto), validação sintática JS, `scripts/test_flagship.py` (**19** testes), `scripts/rox-demo.test.cjs` (**7** testes offline) e `scripts/smoke_http.py` (apenas leitura).
- Após detectar falha no simulador DOM do teste ROX (`quick.querySelectorAll is not a function`), o harness foi ajustado para reproduzir a interface real; o teste agora comprova que as opções rápidas também ficam desabilitadas no limite.
- Os testes do CI **não provam** a renderização visual em Safari nem atingimento das metas Lighthouse.

## Defeitos corrigidos diretamente no PR
1. **Link de handoff ROX ocultável:** movido para fora do log com rolagem, mantendo-o fixo no painel.
2. **Teto de 24 interações:** retornos antecipados e botões de respostas rápidas desativados após o limite. Corrigido texto que sugeria reiniciar só fechando e reabrindo, o que não ocorria.
3. **Conflito ROX × barra sticky no iPhone:** entrada textual acessível do ROX no hero e launcher flutuante somente após a primeira seção (ou enquanto o chat estiver aberto); dock móvel condicionado à presença real da barra, e barra oculta quando painel ROX está aberto.
4. **Menu mobile aberto:** ROX não interfere na área do menu.
5. **SEO inconsistente:** metadados Open Graph de título e descrição alinhados aos metadados da homepage; cor de tema revisada.
6. **Regressões futuras:** cinco novos testes estáticos para SEO, handoff, limite de interações, posicionamento mobile e entrada contextual do ROX.

## Evidência local da prévia independente (não do deploy)
- Gerado um HTML offline de apresentação, com CSS/JS próprios e fotografia real do site como prioridade quando disponível. Se a rede bloquear a imagem externa, exibe fallback vetorial autocontido, **sem imagem quebrada**.
- Emulação Playwright Chromium: **77/77 verificações** em **320, 375, 390, 430, 768, 1024 e 1440 px**. Avaliado: largura, um único H1, fallback, ausência de erros JavaScript, navegação, diálogo ROX, handoff, retorno de foco, limite, barra sticky e não sobreposição.
- Verificação pontual de contraste: **8/8** pares da paleta com razão de contraste igual ou superior a 4,5:1 (menor par: `#777D80` sobre `#090909` ≈ **4,77:1**).
- Prévia HTML demonstrativa (artefato independente do código do PR), teste reproduzível, capturas de desktop/mobile/ROX, antes/depois da prévia e relatórios JSON/Markdown entregues no pacote ZIP desta conversa; **não são capturas do Netlify nem medição de campo**.

## Metas ainda NÃO comprovadas
- Mobile Lighthouse Performance ≥90, Accessibility ≥95, SEO ≥95.
- LCP ≤2,5 segundos; INP ≤200 ms; CLS ≤0,1 (dados reais, não apenas laboratório).
- WCAG 2.2 AA completa, VoiceOver iOS, TalkBack Android e testes em hardware real.
- Equivalência exata entre código `staging` e deploy Netlify atual (possível diferença de artefato).
- Integrações ROX 2.0 / WhatsApp API / CRM, auditoria LGPD, conversa recebida, oportunidades e vendas.
- UX de todas as **outras 80 páginas**: este PR é **Fase 1 da homepage**, não transformação integral do ecossistema.

## Critério para próxima fase
Somente após homologação de staging isolado e consentimento explícito para publicar: testar as rotas antigas, trabalhar métricas de performance, usar evidência de conversa real para atribuição e avaliar o ROX em PR separado. Não fundir PR #2/#3 automaticamente nem habilitar serviços pagos.

**Resultado:** UX mais consistente, testes verificáveis, segurança de escopo preservada. Nenhuma nota absoluta de excelência foi atribuída.
