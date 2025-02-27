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
      <Header redirectTo="/" title="Informasi" />

      <div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize py-3">
        Informasi
      </div>

      <dl className="divide-y border-t -mt-1">
        <div className="px-4 py-3">
          <dt className="text-sm font-medium text-muted-foreground">
            Developer
          </dt>
          <dd className="mt-1 pl-5 text-sm text-foreground">
            <Link href="https://www.linkedin.com/in/hudamnhd">Huda</Link>
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-sm font-medium text-muted-foreground">Nama</dt>
          <dd className="mt-1 pl-5 text-sm text-foreground">Kiat</dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-sm font-medium text-muted-foreground">
            Deskripsi
          </dt>
          <dd className="mt-1 pl-5 text-sm text-foreground">
            Aplikasi sederhana untuk sehari-hari
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-sm font-medium text-muted-foreground">
            Sumber Konten
          </dt>
          <dd className="text-sm text-foreground">
            <List data={sources.content} />
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-sm font-medium text-muted-foreground">
            Huruf Arab
          </dt>
          <dd className="mt-1 text-sm text-foreground">
            <List data={sources.font} />
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-sm font-medium text-muted-foreground">
            Stack dan Dependesi
          </dt>
          <dd className="text-sm text-foreground">
            <List data={sources.stack} />
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-sm font-medium text-muted-foreground">Deploy</dt>
          <dd className="mt-1 text-sm pl-5">
            <List data={sources.deploy} />
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-sm font-medium text-muted-foreground">
            Components
          </dt>
          <dd className="mt-1 text-sm pl-5">
            <Link href="/components">Demo</Link>
          </dd>
        </div>
      </dl>
    </LayoutMain>
  );
}

const List = ({ data }: { data: Menu }) => {
  const navigate = useNavigate();
  return (
    <div
      role="list"
      className="marker:text-muted-foreground list-disc list-inside"
    >
      {data.map((d, index: number) => (
        <div key={index} className="break-all line-clamp-1">
          <TooltipTrigger delay={300}>
            <Link
              href={d.href}
              className="flex items-start justify-start text-start gap-x-1"
            >
              <Minus className="text-muted-foreground w-4 mr-1" />
              <span>
                <strong>{d.title}</strong>{" "}
                <span className="text-foreground">{d.desc}</span>.
              </span>
            </Link>
            <Tooltip placement="bottom">
              <p>{d.href}</p>
            </Tooltip>
          </TooltipTrigger>
        </div>
      ))}
    </div>
  );
};
