import { Header } from "#src/components/custom/header";
import { LayoutMain } from "#src/components/custom/layout.tsx";
import { Tooltip, TooltipTrigger } from "#src/components/ui/tooltip";
import { sources } from "#src/constants/sources";
import { Minus } from "lucide-react";
import { Link } from "react-aria-components";
import { useNavigate } from "react-router";

type Menu = typeof sources.content;

export function Component() {
  return (
    <LayoutMain>
      <Header redirectTo="/" title="Tentang" />

      <div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize py-3">
        Tentang Kiat Aplikasi
      </div>

      <dl className="divide-y border-t -mt-1 mb-4">
        <div className="px-4 py-3">
          <dt className="font-medium mb-3">
            Developer
          </dt>
          <dd className="mt-1 pl-5 text-sm text-foreground space-x-1">
            <Link href="https://www.linkedin.com/in/hudamnhd">Huda</Link>
            <Link href="mailto:muhamadhuda519@gmail.com">
              ( muhamadhuda519@gmail.com )
            </Link>
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="font-medium mb-3">
            Nama
          </dt>
          <dd className="mt-1 pl-5 text-sm text-foreground">Kiat</dd>
        </div>
        <div className="px-4 py-3">
          <dt className="font-medium mb-3">
            Deskripsi
          </dt>
          <dd className="mt-1 pl-5 text-sm text-foreground">
            Aplikasi sederhana untuk sehari-hari
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="font-medium mb-3">
            Sumber Konten
          </dt>
          <dd className="text-sm text-foreground">
            <List data={sources.content} />
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="font-medium mb-3">
            Huruf Arab
          </dt>
          <dd className="mt-1 text-sm text-foreground">
            <List data={sources.font} />
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="font-medium mb-3">
            Stack dan Dependesi
          </dt>
          <dd className="text-sm text-foreground">
            <List data={sources.stack} />
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="font-medium mb-3">
            Deploy
          </dt>
          <dd className="mt-1 text-sm pl-1">
            <List data={sources.deploy} />
          </dd>
        </div>
      </dl>
    </LayoutMain>
  );
}

const List = ({ data }: { data: Menu }) => {
  const navigate = useNavigate();
  return (
    <ul
      role="list"
      className="list-disc pl-5 space-y-1"
    >
      {data.map((item, index: number) => (
        <li key={index} className="pl-1 text-sm">
          <TooltipTrigger delay={300}>
            <Link
              to={item.href}
              className="font-medium text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 sephia:text-blue-500 sephia:hover:text-blue-600"
            >
              {item.title}
              <span className="text-foreground font-normal">
                {" "}
                {item.desc}
              </span>.
            </Link>
            <Tooltip placement="bottom">
              <p>{item.href}</p>
            </Tooltip>
          </TooltipTrigger>
        </li>
      ))}
    </ul>
  );
};
