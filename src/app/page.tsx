import Link from "next/link";

export default function LandingPage() {
  return (
    <div>
      {/* NAV */}
      <header className="sticky top-0 z-40 backdrop-blur bg-[color:var(--cream)]/90 border-b border-[color:var(--line)]">
        <div className="max-w-[1120px] mx-auto flex items-center justify-between px-7 py-4">
          <Link href="/" className="flex items-center gap-2.5 font-[family-name:var(--font-display)] font-semibold text-[19px] text-[color:var(--forest)]">
            <span className="w-[30px] h-[30px] rounded-full bg-[color:var(--green)] flex items-center justify-center flex-none">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 3c-3 3-5 6-5 9a5 5 0 0010 0c0-3-2-6-5-9z" fill="var(--cream)"/></svg>
            </span>
            Shamba Voice
          </Link>
          <ul className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[color:var(--ink-soft)]">
            <li><a href="#how" className="hover:text-[color:var(--forest)]">Jinsi Inavyofanya Kazi</a></li>
            <li><a href="#intelligence" className="hover:text-[color:var(--forest)]">Uwezo wa AI</a></li>
            <li><a href="#trust" className="hover:text-[color:var(--forest)]">Faragha</a></li>
          </ul>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:inline text-[14.5px] font-semibold text-[color:var(--ink-soft)] hover:text-[color:var(--forest)]">Ingia</Link>
            <Link href="/register" className="btn-primary !py-2.5 !px-5 !text-[14.5px]">Anza Kutumia</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0" style={{background:"radial-gradient(ellipse 620px 420px at 88% -6%, rgba(63,107,71,0.10), transparent 60%), radial-gradient(ellipse 500px 360px at -4% 90%, rgba(122,82,51,0.09), transparent 60%)"}} />
        <div className="max-w-[1120px] mx-auto px-7 grid md:grid-cols-2 gap-14 items-center relative">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <span className="w-[7px] h-[7px] rounded-full bg-[color:var(--gold)]" />
              <span className="text-sm font-semibold text-[color:var(--soil)]">Kwa wakulima wadogo wa Tanzania</span>
            </div>
            <h1 className="text-[44px] md:text-[54px] tracking-tight max-w-[11.5ch] leading-[1.08]">Ongea na Shamba Lako.</h1>
            <p className="mt-5 text-lg text-[color:var(--ink-soft)] max-w-[42ch] leading-relaxed">
              Rekodi matumizi, mauzo na uzalishaji wa shamba lako kwa kuongea tu kwa Kiswahili. Hakuna fomu. Hakuna kujaza jedwali.
            </p>
            <div className="flex gap-3.5 mt-8 flex-wrap">
              <Link href="/register" className="btn-primary">Anza Kutumia</Link>
              <a href="#how" className="btn-secondary">Jifunze Zaidi</a>
            </div>
            <div className="mt-7 flex items-center gap-2.5 text-[13.5px] text-[color:var(--ink-faint)]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[color:var(--green-soft)] flex-none"><path d="M12 22s8-4.5 8-11V5l-8-3-8 3v6c0 6.5 8 11 8 11z"/></svg>
              Taarifa za shamba lako zinabaki zako. Hazishirikiwi bila ruhusa yako.
            </div>
          </div>

          <div className="card shadow-lg p-6 max-w-[380px] mx-auto w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[13.5px] text-[color:var(--ink-faint)] font-semibold">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 3.5-7 8-7s8 3 8 7"/></svg>
                Eliya, Shamba la Mahindi
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[color:var(--green)]">
                <span className="w-[7px] h-[7px] rounded-full bg-[color:var(--green)] animate-pulse" />
                Mfano wa moja kwa moja
              </div>
            </div>
            <div className="flex flex-col gap-2.5 min-h-[150px]">
              <div className="bubble farmer">&ldquo;Leo nimelipa vibarua elfu hamsini kwa ajili ya kulima mahindi.&rdquo;</div>
              <div className="bubble system">Nimeandika: Vibarua — TZS 50,000, Kulima Mahindi. Ni sahihi?</div>
              <div className="bubble farmer">&ldquo;Ndiyo.&rdquo;</div>
              <div className="self-end inline-flex items-center gap-1.5 text-[13px] font-semibold text-[color:var(--green)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                Rekodi imehifadhiwa
              </div>
            </div>
            <div className="h-px bg-[color:var(--line)] my-4" />
            <div className="flex items-center gap-3 text-[13px] text-[color:var(--ink-faint)]">
              <div className="flex items-end gap-[2.5px] h-4">
                {[40,90,60,100,50,75].map((h,i)=>(
                  <i key={i} className="wave-bar" style={{height:`${h}%`, animationDelay:`${i*0.1}s`}} />
                ))}
              </div>
              <span>Mfano wa mazungumzo ya kweli</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 md:py-28">
        <div className="max-w-[1120px] mx-auto px-7">
          <div className="max-w-[640px] mb-12">
            <h2 className="text-[32px] md:text-[34px] tracking-tight">Njia tatu tu.</h2>
            <p className="mt-3.5 text-[16.5px] text-[color:var(--ink-soft)] leading-relaxed">
              Hakuna programu ya kujifunza. Unasema, mfumo unaelewa, na unaona shamba lako likieleweka mbele yako.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-[color:var(--line-strong)] border border-[color:var(--line-strong)] rounded-[18px] overflow-hidden">
            {[
              {n:"1", t:"Ongea", d:"Bonyeza kipaza sauti kimoja na sema ulichofanya shambani — kwa Kiswahili chako cha kawaida."},
              {n:"2", t:"Tunarekodi", d:"AI inabadilisha sauti yako kuwa rekodi kamili: aina, kiasi, zao na tarehe — kisha inakuhakikishia kabla ya kuhifadhi."},
              {n:"3", t:"Unaelewa", d:"Ona matumizi, mauzo na faida ya msimu wako kwa muhtasari rahisi — si jedwali la nambari."},
            ].map((s) => (
              <div key={s.n} className="bg-[color:var(--paper)] p-9">
                <div className="w-[34px] h-[34px] rounded-full border-[1.5px] border-[color:var(--soil-soft)] flex items-center justify-center font-[family-name:var(--font-display)] text-[15px] font-semibold text-[color:var(--soil)] mb-5">{s.n}</div>
                <h3 className="text-[21px] mb-2.5">{s.t}</h3>
                <p className="text-[15px] text-[color:var(--ink-soft)] leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FARM INTELLIGENCE */}
      <section id="intelligence" className="py-20 md:py-28 bg-[color:var(--paper)] border-y border-[color:var(--line)]">
        <div className="max-w-[1120px] mx-auto px-7">
          <div className="max-w-[640px] mb-12">
            <h2 className="text-[32px] md:text-[34px] tracking-tight">Shamba lako, kwa muhtasari mmoja.</h2>
            <p className="mt-3.5 text-[16.5px] text-[color:var(--ink-soft)] leading-relaxed">
              Badala ya jedwali refu, unaona matumizi, mauzo na tofauti ya msimu wako kwa mtazamo mmoja tu.
            </p>
          </div>
          <div className="card shadow-lg p-6 md:p-9 grid md:grid-cols-[1.15fr_0.85fr] gap-8 md:gap-0">
            <div className="md:pr-9 md:border-r border-[color:var(--line)] pb-6 md:pb-0 border-b md:border-b-0">
              <div className="text-[13px] text-[color:var(--ink-faint)] font-semibold mb-4">MSIMU HUU</div>
              <dl className="grid grid-cols-2 gap-6">
                <div><dt className="text-[13px] text-[color:var(--ink-faint)] mb-1.5">Matumizi</dt><dd className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[color:var(--forest)]">420,000</dd></div>
                <div><dt className="text-[13px] text-[color:var(--ink-faint)] mb-1.5">Mauzo</dt><dd className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[color:var(--forest)]">850,000</dd></div>
                <div><dt className="text-[13px] text-[color:var(--ink-faint)] mb-1.5">Tofauti</dt><dd className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[color:var(--forest)]">430,000</dd></div>
                <div><dt className="text-[13px] text-[color:var(--ink-faint)] mb-1.5">Mavuno</dt><dd className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[color:var(--forest)]">15 Mifuko</dd></div>
              </dl>
            </div>
            <div className="md:pl-9 flex flex-col gap-4">
              <div className="text-[13px] text-[color:var(--ink-faint)] font-semibold">HIVI KARIBUNI</div>
              {[
                {t:"Mbolea", d:"Leo", a:"−80,000", neg:true},
                {t:"Vibarua", d:"Jana", a:"−50,000", neg:true},
                {t:"Mauzo — Mahindi", d:"02 Sep", a:"+250,000", neg:false},
              ].map((r) => (
                <div key={r.t} className="flex justify-between items-center text-sm">
                  <div className="flex flex-col gap-0.5"><span>{r.t}</span><span className="text-[11.5px] text-[color:var(--ink-faint)]">{r.d}</span></div>
                  <span className={`font-semibold ${r.neg ? "text-[color:var(--soil)]" : "text-[color:var(--green)]"}`}>{r.a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONNECTIVITY */}
      <section className="py-20 md:py-28 bg-[color:var(--forest)] text-[color:var(--paper)]">
        <div className="max-w-[1120px] mx-auto px-7 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-[32px] md:text-[34px] tracking-tight text-[color:var(--paper)]">Inafanya kazi hata bila mtandao mzuri.</h2>
            <p className="mt-4 text-[16.5px] text-[#CFDDCF] leading-relaxed max-w-[42ch]">
              Rekodi yako ya sauti inahifadhiwa kwenye simu yako kwanza. Mtandao ukirudi, inasawazishwa yenyewe — huna cha kufanya.
            </p>
          </div>
          <div className="flex flex-col">
            {[
              {label:"Rekodi ya sauti imefanywa", done:true},
              {label:"Imehifadhiwa kwenye simu", done:true},
              {label:"Inasubiri mtandao...", done:false},
              {label:"Inasawazishwa", done:false},
              {label:"Imekamilika", done:false},
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-3.5 py-3 relative">
                {i > 0 && <span className="absolute left-[11px] -top-2 w-[1.5px] h-3.5 bg-[#3E5B45]" />}
                <div className={`w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center flex-none ${s.done ? "bg-[color:var(--gold)] border-[color:var(--gold)]" : "bg-[#20391F] border-[#4C6E52]"}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="text-[#CFDDCF]"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <span className="text-[15px] text-[#DDE7DA]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section id="trust" className="py-20 md:py-28">
        <div className="max-w-[1120px] mx-auto px-7">
          <div className="max-w-[640px] mb-12">
            <h2 className="text-[32px] md:text-[34px] tracking-tight">Taarifa za fedha za shamba lako ni za siri.</h2>
            <p className="mt-3.5 text-[16.5px] text-[color:var(--ink-soft)] leading-relaxed">Hatuzishiriki bila ruhusa yako, na unaweza kufuta rekodi zako wakati wowote.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {t:"Ruhusa yako kwanza", d:"Hatukusanyi zaidi ya inavyohitajika, na hatushiriki taarifa zako bila wewe kukubali.", icon:"M12 22s8-4.5 8-11V5l-8-3-8 3v6c0 6.5 8 11 8 11z"},
              {t:"Ufikiaji unaodhibitiwa", d:"Ni wewe na wafanyakazi walioruhusiwa tu ndio wanaoweza kuona taarifa za shamba lako.", icon:"M4 10h16v10H4zM8 10V7a4 4 0 018 0v3"},
              {t:"Futa wakati wowote", d:"Unaweza kuomba kufuta rekodi zako au akaunti yako kwa urahisi.", icon:"M3 6h18M6 6v13a2 2 0 002 2h8a2 2 0 002-2V6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"},
            ].map((it) => (
              <div key={it.t}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-[color:var(--soil)] mb-4"><path d={it.icon}/></svg>
                <h3 className="text-lg mb-2">{it.t}</h3>
                <p className="text-[14.5px] text-[color:var(--ink-soft)] leading-relaxed">{it.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="text-center py-20 md:py-24" style={{background:"linear-gradient(160deg,#7A5233,#6B4A2D)"}}>
        <div className="max-w-[1120px] mx-auto px-7">
          <h2 className="text-[color:var(--paper)] text-[32px] md:text-[36px] max-w-[16ch] mx-auto mb-4">Shamba lako liko tayari kusikilizwa.</h2>
          <p className="text-[#EADFCB] text-[16.5px] mb-8">Anza kwa sentensi moja tu leo.</p>
          <Link href="/register" className="btn-primary !bg-[color:var(--paper)] !text-[color:var(--forest)] hover:!bg-white">Anza Kutumia</Link>
        </div>
      </section>

      <footer className="bg-[color:var(--forest)] text-[#B9C6B8] py-14">
        <div className="max-w-[1120px] mx-auto px-7">
          <div className="flex flex-wrap justify-between gap-8 pb-9 border-b border-[#33502F]">
            <div>
              <Link href="/" className="flex items-center gap-2.5 font-[family-name:var(--font-display)] font-semibold text-[19px] text-[color:var(--paper)]">
                <span className="w-[30px] h-[30px] rounded-full bg-[color:var(--green)] flex items-center justify-center flex-none">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 3c-3 3-5 6-5 9a5 5 0 0010 0c0-3-2-6-5-9z" fill="var(--forest)"/></svg>
                </span>
                Shamba Voice
              </Link>
              <p className="mt-3 text-sm text-[#9CB09B] max-w-[32ch]">Mfumo wa kurekodi shamba kwa sauti, uliojengwa kwa mkulima wa Tanzania.</p>
            </div>
            <div className="flex gap-16">
              <div>
                <h4 className="text-[color:var(--paper)] text-[13.5px] font-semibold mb-3.5">Bidhaa</h4>
                <ul className="flex flex-col gap-2.5 text-sm">
                  <li><a href="#how" className="hover:text-[color:var(--paper)]">Jinsi Inavyofanya Kazi</a></li>
                  <li><a href="#intelligence" className="hover:text-[color:var(--paper)]">Akili ya Shamba</a></li>
                  <li><a href="#trust" className="hover:text-[color:var(--paper)]">Faragha</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-[color:var(--paper)] text-[13.5px] font-semibold mb-3.5">Akaunti</h4>
                <ul className="flex flex-col gap-2.5 text-sm">
                  <li><Link href="/login" className="hover:text-[color:var(--paper)]">Ingia</Link></li>
                  <li><Link href="/register" className="hover:text-[color:var(--paper)]">Jisajili</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex justify-between pt-6 text-[13px] text-[#82977F] flex-wrap gap-2.5">
            <span>© 2026 Shamba Voice. Tanzania.</span>
            <span>Imejengwa kwa Kiswahili, kwa mkulima.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
