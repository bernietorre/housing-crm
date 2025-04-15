import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./components/ui/select";
import { Card, CardContent } from "./components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./components/ui/table";
import { Label } from "./components/ui/label";

// Sustituye estos valores antes de compilar
const airtableBaseId = "appJpYpdHFjzq2gxT";
const airtableTableName = "Avalúos";
const airtableToken = "Bearer TU_TOKEN_AQUI";

export default function CRM() {
  const [avalúos, setAvalúos] = useState([]);
  const [form, setForm] = useState({
    cliente: "",
    tipo: "fiscal",
    estatus: "proceso",
    comision: 0,
    pagoReferenciador: 0,
  });

  const fetchAvalúos = async () => {
    try {
      const res = await axios.get(`https://api.airtable.com/v0/${airtableBaseId}/${airtableTableName}`, {
        headers: {
          Authorization: airtableToken,
        },
      });
      const records = res.data.records.map((r) => ({
        cliente: r.fields.Cliente || "",
        tipo: r.fields["Tipo de Avalúo"] || "",
        estatus: r.fields.Estatus || "",
        comision: r.fields.Comisión || 0,
        pagoReferenciador: r.fields["Pago Referenciador"] || 0,
      }));
      setAvalúos(records);
    } catch (err) {
      console.error("Error al obtener datos de Airtable", err);
    }
  };

  const addAvalúo = async () => {
    try {
      await axios.post(`https://api.airtable.com/v0/${airtableBaseId}/${airtableTableName}`,
        {
          fields: {
            Cliente: form.cliente,
            "Tipo de Avalúo": form.tipo,
            Estatus: form.estatus,
            Comisión: parseFloat(form.comision),
            "Pago Referenciador": form.pagoReferenciador,
          },
        },
        {
          headers: {
            Authorization: airtableToken,
            "Content-Type": "application/json",
          },
        }
      );
      fetchAvalúos();
      setForm({ cliente: "", tipo: "fiscal", estatus: "proceso", comision: 0, pagoReferenciador: 0 });
    } catch (err) {
      console.error("Error al agregar avalúo", err);
    }
  };

  const handleChange = (key, value) => {
    const comision = key === "comision" ? parseFloat(value || 0) : form.comision;
    const pagoReferenciador = comision * 0.3;
    setForm((prev) => ({ ...prev, [key]: value, pagoReferenciador }));
  };

  useEffect(() => {
    fetchAvalúos();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cliente</Label>
              <Input value={form.cliente} onChange={(e) => handleChange("cliente", e.target.value)} />
            </div>
            <div>
              <Label>Tipo de Avalúo</Label>
              <Select value={form.tipo} onValueChange={(v) => handleChange("tipo", v)}>
                <SelectTrigger><SelectValue placeholder="Selecciona tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fiscal">Fiscal</SelectItem>
                  <SelectItem value="mejoras">Mejoras</SelectItem>
                  <SelectItem value="referenciado">Referenciado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estatus</Label>
              <Select value={form.estatus} onValueChange={(v) => handleChange("estatus", v)}>
                <SelectTrigger><SelectValue placeholder="Selecciona estatus" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="proceso">En proceso</SelectItem>
                  <SelectItem value="cerrado">Cerrado</SelectItem>
                  <SelectItem value="validado">Validado Tesorería</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Comisión ($)</Label>
              <Input type="number" value={form.comision} onChange={(e) => handleChange("comision", e.target.value)} />
            </div>
            <div>
              <Label>Pago a Referenciador ($)</Label>
              <Input value={form.pagoReferenciador.toFixed(2)} disabled />
            </div>
          </div>
          <Button onClick={addAvalúo}>Agregar Avalúo</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estatus</TableHead>
                <TableHead>Comisión</TableHead>
                <TableHead>Pago Referenciador</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {avalúos.map((a, i) => (
                <TableRow key={i}>
                  <TableCell>{a.cliente}</TableCell>
                  <TableCell>{a.tipo}</TableCell>
                  <TableCell>{a.estatus}</TableCell>
                  <TableCell>${a.comision}</TableCell>
                  <TableCell>${a.pagoReferenciador.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}