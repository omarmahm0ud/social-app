
const stats = [
  { value: '2012', label: 'Founded' },
  { value: '40K+', label: 'Graduates' },
  { value: '50+', label: 'Partner Companies' },
  { value: '5', label: 'Branches' },
  { value: '20', label: 'Diplomas Available' },
]
function AuthIntro() {
 return (
    <div className="">
      <h1 className="text-6xl font-extrabold tracking-tight text-blue-900">
        Route Posts
      </h1>

      <p className="mt-4 max-w-2xl text-2xl text-slate-700">
        Connect with friends and the world around you on Route Posts.
      </p>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-800">
          About Route Academy
        </p>

        <h2 className="mt-3 text-xl font-bold text-slate-900">
          Egypt's Leading IT Training Center Since 2012
        </h2>

        <p className="mt-4 leading-relaxed text-slate-600">
          Route Academy is the premier IT training center in Egypt, established in
          2012. We specialize in delivering high-quality training courses in
          programming, web development, and application development. We've identified
          the unique challenges people may face when learning new technology and made
          efforts to provide strategies to overcome them.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="min-w-[150px] rounded-xl border border-slate-200 bg-slate-50 px-5 py-4"
            >
              <p className="text-lg font-bold text-blue-900">{stat.value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AuthIntro