import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { JOB_PROJECTS, getJobProject, reviewDelivery, testsToCode } from "../src/lib/job-projects";
import { useProgress } from "../src/lib/progress-store";

// Independent implementations of each authored brief, not copies of the assertions.
const implementations: Record<string, string> = {
  "job-s0-caja": "subtotal=sum(precios[item] for item in pedidos)\niva=subtotal*.08\ntotal=subtotal+iva\nprint(total)",
  "job-s0-triage": "urgentes=sum(any(word in ticket.lower() for word in ['caído','down','500']) for ticket in tickets)\nnormales=len(tickets)-urgentes",
  "job-s1-sensores": "media=temps.mean()\ndesv=temps.std()\numbral=media+2*desv\nanomalias=temps[temps>umbral]",
  "job-s1-embeddings": "desvs=X.std(axis=0)\nZ=(X-X.mean(axis=0))/np.where(desvs==0,1,desvs)",
  "job-s2-ventas": "venta_pico=max(ventas)\nmes_pico=meses[ventas.index(venta_pico)]\nplt.bar(meses,ventas)\nplt.title('Ventas Q3')",
  "job-s2-campanas": "media_c=sum(control)/len(control)\nmedia_b=sum(campana_b)/len(campana_b)\nlift_pct=(media_b-media_c)/media_c*100\nplt.plot(control)\nplt.plot(campana_b)",
  "job-s3-leads": "leads=leads.dropna(subset=['email']).copy()\nleads['ciudad']=leads['ciudad'].fillna('Desconocida')\nn_validos=len(leads)\nciudades=leads['ciudad'].value_counts()",
  "job-s3-pedidos": "por_cat=pedidos.groupby('categoria')['importe'].sum()\ncategoria_top=por_cat.idxmax()\nimporte_top=por_cat.max()",
  "job-s4-ab": "media_a=A.mean()\nmedia_b=B.mean()\ndiff=media_b-media_a\nganador='B' if media_b>media_a else 'A'",
  "job-s4-churn": "corr=np.corrcoef(df['minutos'],df['churn'])[0,1]",
  "job-s5-mora": "probs=sigmoid(X@w)\npreds=(probs>=.5).astype(int)\naccuracy=(preds==y).mean()",
  "job-s5-segmentos": "dist=((X[:,None,:]-centros[None,:,:])**2).sum(axis=2)\nlabels=dist.argmin(axis=1)\ntamanos=np.bincount(labels,minlength=3)",
  "job-s6-perceptron": "preds=step(X@w)",
  "job-s6-softmax": "exp=np.exp(logits-logits.max(axis=1,keepdims=True))\nprobs=exp/exp.sum(axis=1,keepdims=True)\nclases=probs.argmax(axis=1)",
  "job-s7-kaggle": "preds=(df['minutos']<40).astype(int)\naccuracy=(preds==df['churn']).mean()\nn_churn=df['churn'].sum()",
  "job-s7-kpis": "def kpis(df):\n    return dict(ingresos=df['importe'].sum(),ticket_medio=df['importe'].mean(),ratio_vip=df['vip'].mean())\nreporte=kpis(pedidos)",
};
assert.equal(Object.keys(implementations).length, JOB_PROJECTS.length);
const rows = JOB_PROJECTS.map((project) => ({ ...project, program: project.starterCode + "\n" + implementations[project.id], checks: testsToCode(project) }));
const python = `import json, sys, tempfile, os, contextlib, io
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
results=[]
for row in json.load(sys.stdin):
    error=None
    original=os.getcwd()
    with tempfile.TemporaryDirectory() as tmp:
        try:
            os.chdir(tmp)
            for name, text in row.get('files',{}).items(): Path(name).write_text(text)
            ns={}
            with contextlib.redirect_stdout(io.StringIO()):
                exec(row['program'],ns)
                exec(row['checks'],ns)
            if row.get('requirePlot'): assert plt.get_fignums(), 'Missing plot'
        except Exception as e: error=str(e)
        finally:
            plt.close('all')
            os.chdir(original)
    results.append(dict(id=row['id'],error=error))
print(json.dumps(results))`;
function execute(inputs: typeof rows) {
  const res = spawnSync("python3", ["-c", python], { input: JSON.stringify(inputs), encoding: "utf8", timeout: 30000 });
  assert.equal(res.status, 0, res.stderr);
  return JSON.parse(res.stdout) as { id: string; error: string | null }[];
}
assert.deepEqual(execute(rows).filter((r) => r.error), [], "Every office brief must accept its correct calculation");
for (const row of rows) assert.equal(reviewDelivery(row, row.program, { ok: true, error: null, images: row.requirePlot ? ["captured"] : [] }).accepted, true, row.id + ": correct delivery must be accepted by the UI");
const softmax = rows.find((r) => r.id === "job-s6-softmax")!;
assert(execute([{ ...softmax, program: softmax.starterCode + "\nprobs=np.eye(3)\nclases=probs.argmax(axis=1)" }])[0].error, "Wrong softmax must be rejected");
const project = getJobProject("job-s0-caja")!;
const code = rows.find((r) => r.id === project.id)!.program;
assert.equal(reviewDelivery(project, project.starterCode, { error: null }).accepted, false);
assert.equal(reviewDelivery(project, code, { error: null, ok: true }).accepted, true);
useProgress.setState({ jobProjects: {}, jobUsd: 0, portfolio: [], xp: 0 });
useProgress.getState().useJobHint(project.id);
useProgress.getState().completeJobProject(project.id, { code });
const salary = useProgress.getState().jobUsd;
useProgress.getState().resetJobProject(project.id);
assert.equal(useProgress.getState().jobProjects[project.id].hintsUsed, 1);
useProgress.getState().completeJobProject(project.id, { code });
assert.equal(useProgress.getState().jobUsd, salary, "Retrying an accepted job must not pay twice");
assert.equal(useProgress.getState().portfolio.length, 1);
console.log("16 office briefs pass; wrong softmax, blank deliveries and duplicate rewards are covered.");
