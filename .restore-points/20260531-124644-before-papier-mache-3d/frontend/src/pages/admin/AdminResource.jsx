import { useEffect, useMemo, useState } from "react";
import { Edit3, Plus, Trash2, X } from "lucide-react";

import { createResource, deleteResource, getResource, updateResource } from "../../api/admin.api.js";
import Button from "../../components/ui/Button.jsx";
import { ErrorState, LoadingState } from "../../components/ui/Status.jsx";

const configs = {
  categories: {
    title: "Categories",
    collection: "categories",
    primary: "name",
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "shortDescription", label: "Short description", type: "textarea" },
      { name: "coverImage", label: "Cover image URL", type: "url" },
      { name: "coverImagePublicId", label: "Cover image public ID" },
      { name: "displayOrder", label: "Display order", type: "number" },
      { name: "featured", label: "Featured", type: "boolean" }
    ]
  },
  crafts: {
    title: "Crafts",
    collection: "crafts",
    primary: "name",
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "category", label: "Category ID", required: true },
      { name: "shortDescription", label: "Short description", type: "textarea" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "history", label: "History", type: "textarea" },
      { name: "makingProcess", label: "Making process", type: "textarea" },
      { name: "geographicalSignificance", label: "Geographical significance", type: "textarea" },
      { name: "heroImage", label: "Hero image URL", type: "url" },
      { name: "heroImagePublicId", label: "Hero image public ID" },
      { name: "relatedArtisans", label: "Related artisan IDs", type: "csv" },
      { name: "displayOrder", label: "Display order", type: "number" },
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "marketplaceEnabled", label: "Marketplace enabled", type: "boolean" }
    ]
  },
  artisans: {
    title: "Artisans",
    collection: "artisans",
    primary: "name",
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "village", label: "Village" },
      { name: "district", label: "District" },
      { name: "biography", label: "Biography", type: "textarea" },
      { name: "profilePhoto", label: "Profile photo URL", type: "url" },
      { name: "profilePhotoPublicId", label: "Profile photo public ID" },
      { name: "yearsOfExperience", label: "Years of experience", type: "number" },
      { name: "craftIds", label: "Craft IDs", type: "csv" },
      { name: "awards", label: "Awards", type: "csv" },
      { name: "featured", label: "Featured", type: "boolean" }
    ]
  },
  articles: {
    title: "Articles",
    collection: "articles",
    primary: "title",
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "excerpt", label: "Excerpt", type: "textarea" },
      { name: "content", label: "Content", type: "textarea", required: true },
      { name: "articleType", label: "Type", type: "select", options: ["history", "story", "blog", "news", "event"] },
      { name: "featuredImage", label: "Featured image URL", type: "url" },
      { name: "featuredImagePublicId", label: "Featured image public ID" },
      { name: "author", label: "Author" },
      { name: "relatedCraft", label: "Related craft ID" },
      { name: "relatedArtisan", label: "Related artisan ID" },
      { name: "publishDate", label: "Publish date", type: "date" },
      { name: "featured", label: "Featured", type: "boolean" }
    ]
  },
  media: {
    title: "Media",
    collection: "media",
    primary: "fileName",
    fields: [
      { name: "fileName", label: "File name", required: true },
      { name: "url", label: "URL", type: "url", required: true },
      { name: "publicId", label: "Public ID", required: true },
      { name: "resourceType", label: "Resource type", type: "select", options: ["image", "video", "raw"] },
      { name: "folder", label: "Folder" },
      { name: "tags", label: "Tags", type: "csv" }
    ]
  }
};

const emptyForm = (fields) =>
  fields.reduce((form, field) => {
    form[field.name] = field.type === "boolean" ? false : "";
    return form;
  }, {});

const listFrom = (data, collection) => data?.[collection] || [];

const toInputValue = (value, field) => {
  if (field.type === "csv") return Array.isArray(value) ? value.map((item) => item?._id || item).join(", ") : "";
  if (field.type === "date" && value) return new Date(value).toISOString().slice(0, 10);
  if (field.type === "boolean") return Boolean(value);
  return value ?? "";
};

const normalize = (form, fields) => {
  const payload = {};

  fields.forEach((field) => {
    const value = form[field.name];

    if (field.type === "boolean") {
      payload[field.name] = Boolean(value);
      return;
    }

    if (value === "" || value === null || value === undefined) return;

    if (field.type === "number") {
      payload[field.name] = Number(value);
      return;
    }

    if (field.type === "csv") {
      payload[field.name] = String(value)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      return;
    }

    payload[field.name] = value;
  });

  return payload;
};

export default function AdminResource({ resource }) {
  const config = configs[resource];
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(() => emptyForm(config.fields));
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const tableFields = useMemo(() => config.fields.slice(0, 4), [config.fields]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getResource(resource);
      setItems(listFrom(data, config.collection));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setForm(emptyForm(config.fields));
    setEditing(null);
    load();
  }, [resource]);

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm(
      config.fields.reduce((next, field) => {
        next[field.name] = toInputValue(item[field.name], field);
        return next;
      }, {})
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm(config.fields));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = normalize(form, config.fields);
      if (editing) {
        await updateResource(resource, editing._id, payload);
      } else {
        await createResource(resource, payload);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(`Delete ${item[config.primary] || "this item"}?`);
    if (!confirmed) return;

    setError(null);
    try {
      await deleteResource(resource, item._id);
      await load();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-actions">
        <div>
          <p className="eyebrow">Manage</p>
          <h1>{config.title}</h1>
        </div>
      </div>

      {error ? <ErrorState error={error} /> : null}

      <form className="admin-panel resource-form" onSubmit={handleSubmit}>
        {config.fields.map((field) => (
          <ResourceField key={field.name} field={field} value={form[field.name]} onChange={handleChange} />
        ))}
        <div className="form-actions field-full">
          <Button disabled={saving} type="submit">
            <Plus size={17} />
            {saving ? "Saving" : editing ? "Update" : "Create"}
          </Button>
          {editing ? (
            <Button variant="secondary" type="button" onClick={resetForm}>
              <X size={17} />
              Cancel
            </Button>
          ) : null}
        </div>
      </form>

      {loading ? <LoadingState /> : null}
      {!loading ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{config.primary}</th>
                {tableFields.filter((field) => field.name !== config.primary).map((field) => (
                  <th key={field.name}>{field.label}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td><strong>{item[config.primary]}</strong><br /><span className="muted">{item.slug || item._id}</span></td>
                  {tableFields.filter((field) => field.name !== config.primary).map((field) => (
                    <td key={field.name}>{displayValue(item[field.name], field)}</td>
                  ))}
                  <td>
                    <div className="table-actions">
                      <button className="icon-button" type="button" onClick={() => handleEdit(item)} aria-label="Edit">
                        <Edit3 size={16} />
                      </button>
                      <button className="icon-button" type="button" onClick={() => handleDelete(item)} aria-label="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length ? (
                <tr>
                  <td colSpan={tableFields.length + 1}>No records yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

function ResourceField({ field, value, onChange }) {
  if (field.type === "boolean") {
    return (
      <label className="checkbox-field">
        <input name={field.name} type="checkbox" checked={Boolean(value)} onChange={onChange} />
        {field.label}
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className="field">
        <span>{field.label}</span>
        <select name={field.name} value={value} onChange={onChange} required={field.required}>
          <option value="">Choose</option>
          {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="field field-full">
        <span>{field.label}</span>
        <textarea name={field.name} value={value} onChange={onChange} required={field.required} />
      </label>
    );
  }

  return (
    <label className="field">
      <span>{field.label}</span>
      <input
        name={field.name}
        type={field.type || "text"}
        value={value}
        onChange={onChange}
        required={field.required}
      />
    </label>
  );
}

function displayValue(value, field) {
  if (field.type === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.map((item) => item?.name || item?.title || item).join(", ");
  if (value && typeof value === "object") return value.name || value.title || value._id;
  if (field.type === "date" && value) return new Date(value).toLocaleDateString();
  return value || "-";
}
